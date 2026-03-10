#!/usr/bin/env python3
"""
ESA Agent Army Framework
Core system for managing 20+ autonomous business agents
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp
import subprocess

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - AGENT-ARMY - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('agent_army.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AgentStatus(Enum):
    STARTING = "starting"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    STOPPED = "stopped"

@dataclass
class AgentConfig:
    """Configuration for an individual agent"""
    agent_id: str
    name: str
    emoji: str
    role: str
    description: str
    skills: List[str]
    memory_limit_mb: int
    startup_command: str
    dependencies: List[str]
    priority: int  # 1-10, higher = more critical
    auto_restart: bool = True
    max_restarts: int = 5
    restart_delay: int = 30

@dataclass
class AgentState:
    """Runtime state of an agent"""
    config: AgentConfig
    status: AgentStatus
    pid: Optional[int] = None
    start_time: Optional[datetime] = None
    restart_count: int = 0
    last_heartbeat: Optional[datetime] = None
    memory_usage_mb: float = 0.0
    cpu_usage_percent: float = 0.0
    error_message: Optional[str] = None

class AgentArmy:
    """Master controller for all ESA business agents"""
    
    def __init__(self):
        self.agents: Dict[str, AgentState] = {}
        self.running = False
        self.heartbeat_interval = 30  # seconds
        self.army_start_time = None
        
    def register_agent(self, config: AgentConfig) -> bool:
        """Register a new agent with the army"""
        try:
            if config.agent_id in self.agents:
                logger.warning(f"Agent {config.agent_id} already registered, updating config")
            
            # Create agent state
            state = AgentState(
                config=config,
                status=AgentStatus.STOPPED
            )
            
            self.agents[config.agent_id] = state
            logger.info(f"✅ Registered agent: {config.emoji} {config.name} ({config.role})")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to register agent {config.agent_id}: {e}")
            return False
    
    async def start_agent(self, agent_id: str) -> bool:
        """Start a specific agent"""
        if agent_id not in self.agents:
            logger.error(f"Agent {agent_id} not found")
            return False
        
        agent = self.agents[agent_id]
        
        if agent.status == AgentStatus.RUNNING:
            logger.info(f"Agent {agent_id} already running")
            return True
        
        try:
            logger.info(f"🚀 Starting agent: {agent.config.emoji} {agent.config.name}")
            
            # Check dependencies first
            for dep_id in agent.config.dependencies:
                if dep_id not in self.agents or self.agents[dep_id].status != AgentStatus.RUNNING:
                    logger.error(f"❌ Dependency {dep_id} not running for agent {agent_id}")
                    return False
            
            # Update status
            agent.status = AgentStatus.STARTING
            agent.start_time = datetime.now()
            
            # Execute startup command
            if agent.config.startup_command:
                process = subprocess.Popen(
                    agent.config.startup_command.split(),
                    cwd=f"/Users/henry/.openclaw/workspace/agent-army/{agent_id}",
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL
                )
                agent.pid = process.pid
            
            # Mark as running
            agent.status = AgentStatus.RUNNING
            agent.last_heartbeat = datetime.now()
            
            logger.info(f"✅ Started agent {agent.config.emoji} {agent.config.name} (PID: {agent.pid})")
            return True
            
        except Exception as e:
            agent.status = AgentStatus.ERROR
            agent.error_message = str(e)
            logger.error(f"❌ Failed to start agent {agent_id}: {e}")
            return False
    
    async def stop_agent(self, agent_id: str) -> bool:
        """Stop a specific agent"""
        if agent_id not in self.agents:
            return False
        
        agent = self.agents[agent_id]
        
        try:
            if agent.pid:
                os.kill(agent.pid, 15)  # SIGTERM
                await asyncio.sleep(2)
                
                # Force kill if still running
                try:
                    os.kill(agent.pid, 9)  # SIGKILL
                except ProcessLookupError:
                    pass  # Already dead
            
            agent.status = AgentStatus.STOPPED
            agent.pid = None
            logger.info(f"🛑 Stopped agent: {agent.config.emoji} {agent.config.name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error stopping agent {agent_id}: {e}")
            return False
    
    async def restart_agent(self, agent_id: str) -> bool:
        """Restart a specific agent"""
        agent = self.agents[agent_id]
        
        if agent.restart_count >= agent.config.max_restarts:
            logger.error(f"❌ Agent {agent_id} exceeded max restarts ({agent.config.max_restarts})")
            return False
        
        logger.info(f"🔄 Restarting agent: {agent.config.emoji} {agent.config.name}")
        
        await self.stop_agent(agent_id)
        await asyncio.sleep(agent.config.restart_delay)
        
        agent.restart_count += 1
        return await self.start_agent(agent_id)
    
    async def start_army(self, priority_order: bool = True) -> bool:
        """Start all registered agents"""
        logger.info("🚀 STARTING ESA AGENT ARMY")
        logger.info(f"📊 Total agents to deploy: {len(self.agents)}")
        
        self.army_start_time = datetime.now()
        self.running = True
        
        # Sort agents by priority if requested
        agents_to_start = list(self.agents.keys())
        if priority_order:
            agents_to_start.sort(key=lambda x: self.agents[x].config.priority, reverse=True)
        
        success_count = 0
        for agent_id in agents_to_start:
            if await self.start_agent(agent_id):
                success_count += 1
            await asyncio.sleep(2)  # Stagger startup
        
        logger.info(f"✅ Agent Army deployed: {success_count}/{len(self.agents)} agents running")
        
        # Start monitoring loop
        asyncio.create_task(self.monitor_army())
        
        return success_count == len(self.agents)
    
    async def stop_army(self) -> None:
        """Stop all agents"""
        logger.info("🛑 STOPPING ESA AGENT ARMY")
        
        self.running = False
        
        # Stop agents in reverse priority order
        agents_to_stop = sorted(self.agents.keys(), 
                               key=lambda x: self.agents[x].config.priority)
        
        for agent_id in agents_to_stop:
            await self.stop_agent(agent_id)
            await asyncio.sleep(1)
        
        logger.info("👋 Agent Army stopped")
    
    async def monitor_army(self) -> None:
        """Monitor all agents and restart failed ones"""
        logger.info("👁️  Agent Army monitoring started")
        
        while self.running:
            try:
                await asyncio.sleep(self.heartbeat_interval)
                
                for agent_id, agent in self.agents.items():
                    if agent.status != AgentStatus.RUNNING:
                        continue
                    
                    # Check if process is still alive
                    if agent.pid:
                        try:
                            os.kill(agent.pid, 0)  # Check if process exists
                        except ProcessLookupError:
                            logger.warning(f"⚠️ Agent {agent_id} process died, restarting...")
                            if agent.config.auto_restart:
                                await self.restart_agent(agent_id)
                    
                    # Update resource usage (simplified)
                    agent.memory_usage_mb = self.get_memory_usage(agent.pid)
                    agent.cpu_usage_percent = self.get_cpu_usage(agent.pid)
                
            except Exception as e:
                logger.error(f"❌ Army monitoring error: {e}")
        
        logger.info("👁️  Agent Army monitoring stopped")
    
    def get_memory_usage(self, pid: Optional[int]) -> float:
        """Get memory usage for a process (simplified)"""
        if not pid:
            return 0.0
        
        try:
            result = subprocess.run(['ps', '-p', str(pid), '-o', 'rss='], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return float(result.stdout.strip()) / 1024  # Convert KB to MB
        except:
            pass
        return 0.0
    
    def get_cpu_usage(self, pid: Optional[int]) -> float:
        """Get CPU usage for a process (simplified)"""
        if not pid:
            return 0.0
        
        try:
            result = subprocess.run(['ps', '-p', str(pid), '-o', '%cpu='], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                return float(result.stdout.strip())
        except:
            pass
        return 0.0
    
    def get_army_status(self) -> Dict[str, Any]:
        """Get comprehensive army status"""
        running_count = sum(1 for agent in self.agents.values() 
                           if agent.status == AgentStatus.RUNNING)
        
        total_memory = sum(agent.memory_usage_mb for agent in self.agents.values())
        total_cpu = sum(agent.cpu_usage_percent for agent in self.agents.values())
        
        uptime = None
        if self.army_start_time:
            uptime = datetime.now() - self.army_start_time
        
        return {
            'army_running': self.running,
            'total_agents': len(self.agents),
            'running_agents': running_count,
            'stopped_agents': len(self.agents) - running_count,
            'total_memory_mb': total_memory,
            'total_cpu_percent': total_cpu,
            'uptime': str(uptime) if uptime else None,
            'agents': {
                agent_id: {
                    'name': agent.config.name,
                    'emoji': agent.config.emoji,
                    'status': agent.status.value,
                    'memory_mb': agent.memory_usage_mb,
                    'cpu_percent': agent.cpu_usage_percent,
                    'restart_count': agent.restart_count,
                    'uptime': str(datetime.now() - agent.start_time) if agent.start_time else None
                }
                for agent_id, agent in self.agents.items()
            }
        }
    
    def save_army_config(self, filepath: str) -> None:
        """Save current army configuration to file"""
        config_data = {
            'agents': {
                agent_id: asdict(agent.config)
                for agent_id, agent in self.agents.items()
            },
            'saved_at': datetime.now().isoformat()
        }
        
        with open(filepath, 'w') as f:
            json.dump(config_data, f, indent=2)
        
        logger.info(f"💾 Army configuration saved to {filepath}")
    
    def load_army_config(self, filepath: str) -> bool:
        """Load army configuration from file"""
        try:
            with open(filepath, 'r') as f:
                config_data = json.load(f)
            
            for agent_id, agent_config_dict in config_data['agents'].items():
                config = AgentConfig(**agent_config_dict)
                self.register_agent(config)
            
            logger.info(f"📁 Army configuration loaded from {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load army config: {e}")
            return False

# Global army instance
army = AgentArmy()

async def main():
    """Main function for testing"""
    print("🤖 ESA Agent Army Framework")
    print("=" * 50)
    print("Ready to deploy business automation agents")

if __name__ == "__main__":
    asyncio.run(main())