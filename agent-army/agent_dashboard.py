#!/usr/bin/env python3
"""
ESA Agent Army Dashboard
Real-time monitoring and control of all 20+ business agents
"""

import tkinter as tk
from tkinter import ttk, scrolledtext
import threading
import time
import json
from datetime import datetime
import subprocess
import asyncio
from agent_framework import army
from esa_agents import create_esa_agent_army

class AgentArmyDashboard:
    """Dashboard for monitoring and controlling ESA agent army"""
    
    def __init__(self):
        self.root = tk.Tk()
        self.setup_window()
        self.setup_ui()
        self.army_loaded = False
        self.load_army()
        self.schedule_refresh()
        
    def setup_window(self):
        """Configure the main window"""
        self.root.title("🤖 ESA Agent Army Command Center")
        self.root.geometry("1200x800")
        
        # Center the window
        self.root.update_idletasks()
        x = (self.root.winfo_screenwidth() // 2) - (1200 // 2)
        y = (self.root.winfo_screenheight() // 2) - (800 // 2)
        self.root.geometry(f"1200x800+{x}+{y}")
        
        # Configure styling
        style = ttk.Style()
        style.theme_use('aqua')
        
    def setup_ui(self):
        """Create the user interface"""
        # Create main notebook
        notebook = ttk.Notebook(self.root)
        notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Army Overview Tab
        self.setup_overview_tab(notebook)
        
        # Individual Agents Tab
        self.setup_agents_tab(notebook)
        
        # Performance Tab
        self.setup_performance_tab(notebook)
        
        # Control Panel Tab
        self.setup_control_tab(notebook)
        
        # Logs Tab
        self.setup_logs_tab(notebook)
        
    def setup_overview_tab(self, notebook):
        """Create army overview tab"""
        overview_frame = ttk.Frame(notebook)
        notebook.add(overview_frame, text="🏢 Army Overview")
        
        # Title
        title_label = ttk.Label(overview_frame, text="🤖 ESA Agent Army Command Center", 
                               font=('SF Pro Display', 18, 'bold'))
        title_label.pack(pady=(10, 20))
        
        # Stats frame
        stats_frame = ttk.LabelFrame(overview_frame, text="Army Statistics", padding="20")
        stats_frame.pack(fill=tk.X, padx=20, pady=10)
        
        # Create stats grid
        stats_grid = ttk.Frame(stats_frame)
        stats_grid.pack(fill=tk.X)
        
        # Left column stats
        left_stats = ttk.Frame(stats_grid)
        left_stats.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self.total_agents_stat = ttk.Label(left_stats, text="Total Agents: --", 
                                          font=('SF Pro Display', 14))
        self.total_agents_stat.pack(anchor=tk.W, pady=3)
        
        self.running_agents_stat = ttk.Label(left_stats, text="Running Agents: --", 
                                           font=('SF Pro Display', 14))
        self.running_agents_stat.pack(anchor=tk.W, pady=3)
        
        self.stopped_agents_stat = ttk.Label(left_stats, text="Stopped Agents: --", 
                                           font=('SF Pro Display', 14))
        self.stopped_agents_stat.pack(anchor=tk.W, pady=3)
        
        # Right column stats
        right_stats = ttk.Frame(stats_grid)
        right_stats.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        self.memory_usage_stat = ttk.Label(right_stats, text="Memory Usage: -- MB", 
                                         font=('SF Pro Display', 14))
        self.memory_usage_stat.pack(anchor=tk.W, pady=3)
        
        self.cpu_usage_stat = ttk.Label(right_stats, text="CPU Usage: --%", 
                                      font=('SF Pro Display', 14))
        self.cpu_usage_stat.pack(anchor=tk.W, pady=3)
        
        self.uptime_stat = ttk.Label(right_stats, text="Army Uptime: --", 
                                   font=('SF Pro Display', 14))
        self.uptime_stat.pack(anchor=tk.W, pady=3)
        
        # Business metrics frame
        business_frame = ttk.LabelFrame(overview_frame, text="Business Metrics", padding="20")
        business_frame.pack(fill=tk.X, padx=20, pady=10)
        
        business_grid = ttk.Frame(business_frame)
        business_grid.pack(fill=tk.X)
        
        # Left business metrics
        left_business = ttk.Frame(business_grid)
        left_business.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        self.prospects_stat = ttk.Label(left_business, text="Daily Prospects: --", 
                                      font=('SF Pro Display', 12))
        self.prospects_stat.pack(anchor=tk.W, pady=2)
        
        self.pipeline_stat = ttk.Label(left_business, text="Pipeline Value: $--", 
                                     font=('SF Pro Display', 12))
        self.pipeline_stat.pack(anchor=tk.W, pady=2)
        
        # Right business metrics
        right_business = ttk.Frame(business_grid)
        right_business.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True)
        
        self.revenue_stat = ttk.Label(right_business, text="Monthly Revenue: $--", 
                                    font=('SF Pro Display', 12))
        self.revenue_stat.pack(anchor=tk.W, pady=2)
        
        self.efficiency_stat = ttk.Label(right_business, text="Army Efficiency: --%", 
                                       font=('SF Pro Display', 12))
        self.efficiency_stat.pack(anchor=tk.W, pady=2)
        
        # Quick actions
        actions_frame = ttk.Frame(overview_frame)
        actions_frame.pack(fill=tk.X, padx=20, pady=20)
        
        ttk.Button(actions_frame, text="🚀 Start All Agents", 
                  command=self.start_all_agents, width=20).pack(side=tk.LEFT, padx=5)
        ttk.Button(actions_frame, text="🛑 Stop All Agents", 
                  command=self.stop_all_agents, width=20).pack(side=tk.LEFT, padx=5)
        ttk.Button(actions_frame, text="🔄 Restart Army", 
                  command=self.restart_army, width=20).pack(side=tk.LEFT, padx=5)
        ttk.Button(actions_frame, text="📊 Refresh Data", 
                  command=self.update_data, width=20).pack(side=tk.LEFT, padx=5)
        
    def setup_agents_tab(self, notebook):
        """Create individual agents tab"""
        agents_frame = ttk.Frame(notebook)
        notebook.add(agents_frame, text="🤖 Individual Agents")
        
        # Agents list
        ttk.Label(agents_frame, text="🎯 Agent Status Overview", 
                 font=('SF Pro Display', 16, 'bold')).pack(pady=(10, 10))
        
        # Create treeview for agents
        columns = ('Agent', 'Status', 'Memory', 'CPU', 'Uptime', 'Restarts')
        self.agents_tree = ttk.Treeview(agents_frame, columns=columns, show='headings', height=18)
        
        # Define headings
        self.agents_tree.heading('Agent', text='Agent')
        self.agents_tree.heading('Status', text='Status')
        self.agents_tree.heading('Memory', text='Memory (MB)')
        self.agents_tree.heading('CPU', text='CPU %')
        self.agents_tree.heading('Uptime', text='Uptime')
        self.agents_tree.heading('Restarts', text='Restarts')
        
        # Configure column widths
        self.agents_tree.column('Agent', width=250)
        self.agents_tree.column('Status', width=100)
        self.agents_tree.column('Memory', width=100)
        self.agents_tree.column('CPU', width=80)
        self.agents_tree.column('Uptime', width=120)
        self.agents_tree.column('Restarts', width=80)
        
        # Add scrollbar
        agents_scrollbar = ttk.Scrollbar(agents_frame, orient=tk.VERTICAL, command=self.agents_tree.yview)
        self.agents_tree.configure(yscrollcommand=agents_scrollbar.set)
        
        # Pack treeview and scrollbar
        tree_frame = ttk.Frame(agents_frame)
        tree_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        self.agents_tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        agents_scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Agent control buttons
        control_frame = ttk.Frame(agents_frame)
        control_frame.pack(fill=tk.X, padx=20, pady=10)
        
        ttk.Button(control_frame, text="🚀 Start Selected", 
                  command=self.start_selected_agent).pack(side=tk.LEFT, padx=5)
        ttk.Button(control_frame, text="🛑 Stop Selected", 
                  command=self.stop_selected_agent).pack(side=tk.LEFT, padx=5)
        ttk.Button(control_frame, text="🔄 Restart Selected", 
                  command=self.restart_selected_agent).pack(side=tk.LEFT, padx=5)
        
    def setup_performance_tab(self, notebook):
        """Create performance monitoring tab"""
        performance_frame = ttk.Frame(notebook)
        notebook.add(performance_frame, text="📈 Performance")
        
        # Performance metrics
        ttk.Label(performance_frame, text="📊 System Performance", 
                 font=('SF Pro Display', 16, 'bold')).pack(pady=(10, 10))
        
        # Resource usage frame
        resource_frame = ttk.LabelFrame(performance_frame, text="Resource Usage", padding="15")
        resource_frame.pack(fill=tk.X, padx=20, pady=10)
        
        # Memory usage breakdown
        memory_frame = ttk.Frame(resource_frame)
        memory_frame.pack(fill=tk.X, pady=5)
        
        ttk.Label(memory_frame, text="Memory Usage by Tier:", 
                 font=('SF Pro Display', 12, 'bold')).pack(anchor=tk.W)
        
        self.tier1_memory = ttk.Label(memory_frame, text="Tier 1 (Leadership): -- MB")
        self.tier1_memory.pack(anchor=tk.W, padx=20)
        
        self.tier2_memory = ttk.Label(memory_frame, text="Tier 2 (Operations): -- MB")
        self.tier2_memory.pack(anchor=tk.W, padx=20)
        
        self.tier3_memory = ttk.Label(memory_frame, text="Tier 3 (Specialists): -- MB")
        self.tier3_memory.pack(anchor=tk.W, padx=20)
        
        # Performance recommendations
        recommendations_frame = ttk.LabelFrame(performance_frame, text="Optimization Recommendations", padding="15")
        recommendations_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=10)
        
        self.recommendations_text = scrolledtext.ScrolledText(recommendations_frame, height=10, 
                                                            font=('Monaco', 11))
        self.recommendations_text.pack(fill=tk.BOTH, expand=True)
        
    def setup_control_tab(self, notebook):
        """Create control panel tab"""
        control_frame = ttk.Frame(notebook)
        notebook.add(control_frame, text="⚙️ Control Panel")
        
        # Army controls
        army_controls = ttk.LabelFrame(control_frame, text="Army Controls", padding="15")
        army_controls.pack(fill=tk.X, padx=20, pady=20)
        
        control_buttons = [
            ("🚀 Deploy Complete Army", self.deploy_army),
            ("🔄 Restart All Agents", self.restart_army),
            ("🛑 Emergency Stop All", self.emergency_stop),
            ("📊 Generate Status Report", self.generate_report),
            ("💾 Save Army Configuration", self.save_config),
            ("📁 Load Army Configuration", self.load_config),
        ]
        
        for i, (text, command) in enumerate(control_buttons):
            row = i // 2
            col = i % 2
            ttk.Button(army_controls, text=text, command=command, width=30).grid(
                row=row, column=col, padx=10, pady=5, sticky='ew')
        
        # Configure grid weights
        army_controls.columnconfigure(0, weight=1)
        army_controls.columnconfigure(1, weight=1)
        
        # Configuration frame
        config_frame = ttk.LabelFrame(control_frame, text="Configuration", padding="15")
        config_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Add configuration options here
        ttk.Label(config_frame, text="Army configuration options will be added here").pack()
        
    def setup_logs_tab(self, notebook):
        """Create logs monitoring tab"""
        logs_frame = ttk.Frame(notebook)
        notebook.add(logs_frame, text="📋 Logs")
        
        # Log selector
        log_control_frame = ttk.Frame(logs_frame)
        log_control_frame.pack(fill=tk.X, padx=20, pady=10)
        
        ttk.Label(log_control_frame, text="Select Log:").pack(side=tk.LEFT)
        
        self.log_var = tk.StringVar(value="agent_army.log")
        log_combo = ttk.Combobox(log_control_frame, textvariable=self.log_var, width=30)
        log_combo['values'] = ["agent_army.log", "henry.log", "rex.log", "marketing_director.log"]
        log_combo.pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Button(log_control_frame, text="🔄 Refresh Log", 
                  command=self.refresh_log).pack(side=tk.LEFT, padx=(10, 0))
        
        ttk.Button(log_control_frame, text="🗑️ Clear Log", 
                  command=self.clear_log).pack(side=tk.LEFT, padx=(10, 0))
        
        # Log display
        self.log_text = scrolledtext.ScrolledText(logs_frame, height=25, font=('Monaco', 10))
        self.log_text.pack(fill=tk.BOTH, expand=True, padx=20, pady=(0, 20))
        
    def load_army(self):
        """Load the agent army configuration"""
        try:
            create_esa_agent_army()
            self.army_loaded = True
        except Exception as e:
            print(f"Error loading army: {e}")
    
    def update_data(self):
        """Update all data displays"""
        if not self.army_loaded:
            return
        
        try:
            status = army.get_army_status()
            
            # Update overview stats
            self.total_agents_stat.config(text=f"Total Agents: {status['total_agents']}")
            self.running_agents_stat.config(text=f"Running Agents: {status['running_agents']}")
            self.stopped_agents_stat.config(text=f"Stopped Agents: {status['stopped_agents']}")
            self.memory_usage_stat.config(text=f"Memory Usage: {status['total_memory_mb']:.1f} MB")
            self.cpu_usage_stat.config(text=f"CPU Usage: {status['total_cpu_percent']:.1f}%")
            self.uptime_stat.config(text=f"Army Uptime: {status['uptime'] or 'Not started'}")
            
            # Update business metrics (simulated for now)
            self.prospects_stat.config(text="Daily Prospects: 150")
            self.pipeline_stat.config(text="Pipeline Value: $2.1M")
            self.revenue_stat.config(text="Monthly Revenue: $415K")
            self.efficiency_stat.config(text=f"Army Efficiency: {min(95, status['running_agents']/status['total_agents']*100):.0f}%")
            
            # Update agents tree
            self.update_agents_tree(status['agents'])
            
            # Update performance recommendations
            self.update_recommendations(status)
            
        except Exception as e:
            print(f"Error updating data: {e}")
    
    def update_agents_tree(self, agents_data):
        """Update the agents treeview"""
        # Clear existing items
        for item in self.agents_tree.get_children():
            self.agents_tree.delete(item)
        
        # Add agents sorted by priority
        for agent_id, agent_info in agents_data.items():
            status_emoji = "✅" if agent_info['status'] == 'running' else "❌"
            values = (
                f"{agent_info['emoji']} {agent_info['name']}",
                f"{status_emoji} {agent_info['status']}",
                f"{agent_info['memory_mb']:.1f}",
                f"{agent_info['cpu_percent']:.1f}",
                agent_info['uptime'] or '--',
                agent_info['restart_count']
            )
            self.agents_tree.insert('', 'end', values=values, tags=(agent_id,))
    
    def update_recommendations(self, status):
        """Update performance recommendations"""
        recommendations = []
        
        if status['running_agents'] < status['total_agents']:
            missing = status['total_agents'] - status['running_agents']
            recommendations.append(f"⚠️ {missing} agents are not running. Consider restarting them.")
        
        if status['total_memory_mb'] > 8000:
            recommendations.append(f"💾 High memory usage ({status['total_memory_mb']:.1f} MB). Consider upgrading to Mac Studio with 64GB RAM.")
        elif status['total_memory_mb'] > 4000:
            recommendations.append(f"📊 Moderate memory usage ({status['total_memory_mb']:.1f} MB). Monitor for growth.")
        
        if status['total_cpu_percent'] > 80:
            recommendations.append(f"🖥️ High CPU usage ({status['total_cpu_percent']:.1f}%). Consider optimizing agent workloads.")
        
        if status['running_agents'] == status['total_agents']:
            recommendations.append("✅ All agents running optimally!")
            recommendations.append("🚀 Your autonomous business is fully operational.")
        
        if not recommendations:
            recommendations.append("📊 System performance looks good!")
        
        self.recommendations_text.delete(1.0, tk.END)
        self.recommendations_text.insert(1.0, "\n".join(recommendations))
    
    def start_all_agents(self):
        """Start all agents"""
        def start_async():
            asyncio.run(army.start_army())
            self.update_data()
        
        threading.Thread(target=start_async, daemon=True).start()
    
    def stop_all_agents(self):
        """Stop all agents"""
        def stop_async():
            asyncio.run(army.stop_army())
            self.update_data()
        
        threading.Thread(target=stop_async, daemon=True).start()
    
    def restart_army(self):
        """Restart the entire army"""
        def restart_async():
            asyncio.run(army.stop_army())
            time.sleep(5)
            asyncio.run(army.start_army())
            self.update_data()
        
        threading.Thread(target=restart_async, daemon=True).start()
    
    def start_selected_agent(self):
        """Start selected agent"""
        # Implementation for starting selected agent
        print("Start selected agent - to be implemented")
    
    def stop_selected_agent(self):
        """Stop selected agent"""
        # Implementation for stopping selected agent
        print("Stop selected agent - to be implemented")
    
    def restart_selected_agent(self):
        """Restart selected agent"""
        # Implementation for restarting selected agent
        print("Restart selected agent - to be implemented")
    
    def deploy_army(self):
        """Deploy the complete army"""
        print("Deploy army - to be implemented")
    
    def emergency_stop(self):
        """Emergency stop all agents"""
        self.stop_all_agents()
    
    def generate_report(self):
        """Generate status report"""
        print("Generate report - to be implemented")
    
    def save_config(self):
        """Save army configuration"""
        print("Save config - to be implemented")
    
    def load_config(self):
        """Load army configuration"""
        print("Load config - to be implemented")
    
    def refresh_log(self):
        """Refresh the selected log"""
        try:
            log_file = f"/Users/henry/.openclaw/workspace/agent-army/{self.log_var.get()}"
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    lines = f.readlines()
                    recent_lines = lines[-100:] if len(lines) > 100 else lines
                    
                self.log_text.delete(1.0, tk.END)
                self.log_text.insert(1.0, ''.join(recent_lines))
                self.log_text.see(tk.END)
        except Exception as e:
            self.log_text.delete(1.0, tk.END)
            self.log_text.insert(1.0, f"Error reading log: {e}")
    
    def clear_log(self):
        """Clear the log display"""
        self.log_text.delete(1.0, tk.END)
    
    def schedule_refresh(self):
        """Schedule automatic refresh"""
        def refresh_loop():
            while True:
                time.sleep(30)  # Refresh every 30 seconds
                try:
                    self.root.after(0, self.update_data)
                except:
                    break
        
        refresh_thread = threading.Thread(target=refresh_loop, daemon=True)
        refresh_thread.start()
    
    def run(self):
        """Start the dashboard"""
        # Initial data load
        self.update_data()
        self.refresh_log()
        
        # Start the GUI
        self.root.mainloop()

if __name__ == "__main__":
    print("🖥️ Starting ESA Agent Army Dashboard...")
    dashboard = AgentArmyDashboard()
    dashboard.run()