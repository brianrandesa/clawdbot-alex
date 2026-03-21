import * as THREE from "three";

const BASE_AGENTS = [
  {
    id: "brian",
    name: "Brian (CEO)",
    color: 0x18b9ff,
    skin: 0xe0b08d,
    hair: 0x201610,
    homeZone: "executive",
    orgGroup: "executive",
    orgIndex: 0,
  },
  {
    id: "denise",
    name: "Denise (COO)",
    color: 0x7ab7ff,
    skin: 0xd6a17f,
    hair: 0x2d2019,
    homeZone: "fulfillment",
    orgGroup: "fulfillment_lead",
    orgIndex: 0,
  },
  {
    id: "malachi",
    name: "Malachi",
    color: 0x7fd0ff,
    skin: 0x9f6b4f,
    hair: 0x110f0e,
    orgGroup: "sales_ops",
    orgIndex: 0,
  },
  {
    id: "james_mungai",
    name: "James Mungai",
    color: 0x92c4ff,
    skin: 0xf1cfb8,
    hair: 0x2a1b15,
    orgGroup: "ticket_sales",
    orgIndex: 3,
  },
  {
    id: "kim_ortega",
    name: "Kim Ortega",
    color: 0x8ec9ff,
    skin: 0xe4b79b,
    hair: 0x3a2a22,
    orgGroup: "sales_support",
    orgIndex: 0,
  },
  {
    id: "diamond",
    name: "Diamond",
    color: 0x9ed4ff,
    skin: 0xc58d6c,
    hair: 0x2f1d15,
    orgGroup: "sales_support",
    orgIndex: 1,
  },
  {
    id: "shah",
    name: "Shah",
    color: 0x88b8ff,
    skin: 0xc08a66,
    hair: 0x1c1410,
    orgGroup: "delivery",
    orgIndex: 0,
  },
  {
    id: "hamza",
    name: "Hamza",
    color: 0x8faeff,
    skin: 0xd59b7f,
    hair: 0x1f1712,
    orgGroup: "delivery",
    orgIndex: 1,
  },
  {
    id: "jawad",
    name: "Jawad",
    color: 0x86c2ff,
    skin: 0xb88162,
    hair: 0x1a130f,
    orgGroup: "delivery",
    orgIndex: 2,
  },
  {
    id: "kim_pusa",
    name: "Kim Pusa",
    color: 0x9cbfff,
    skin: 0xe5b79a,
    hair: 0x33251e,
    orgGroup: "delivery",
    orgIndex: 3,
  },
  {
    id: "muhammad",
    name: "Muhammad",
    color: 0x7fb4ff,
    skin: 0xa06d4f,
    hair: 0x110f0e,
    orgGroup: "marketing",
    orgIndex: 0,
  },
  {
    id: "sohaib",
    name: "Sohaib",
    color: 0x89bdff,
    skin: 0xb88362,
    hair: 0x1c140f,
    orgGroup: "marketing",
    orgIndex: 1,
  },
  {
    id: "emanuela",
    name: "Emanuela",
    color: 0x8bb9ff,
    skin: 0x9d6649,
    hair: 0x120f0d,
    orgGroup: "ticket_sales",
    orgIndex: 0,
  },
  {
    id: "jeff_dazer",
    name: "Jeff Dazer",
    color: 0x92b4ff,
    skin: 0xca9776,
    hair: 0x221913,
    orgGroup: "ticket_sales",
    orgIndex: 1,
  },
  {
    id: "jacob_dawson",
    name: "Jacob Dawson",
    color: 0x86b0ff,
    skin: 0xc29070,
    hair: 0x1f1611,
    orgGroup: "ticket_sales",
    orgIndex: 2,
  },
  {
    id: "amit",
    name: "Amit (Bookkeeper)",
    color: 0x7fbec0,
    skin: 0xcfa07f,
    hair: 0x2b1f17,
    orgGroup: "finance",
    orgIndex: 0,
  },
  {
    id: "victoria",
    name: "Victoria (Core Bot)",
    color: 0x74b2ff,
    skin: 0xf0be9d,
    hair: 0x2a1b15,
    orgGroup: "ai_core",
    orgIndex: 0,
  },
  {
    id: "sebastian",
    name: "Sebastian (Core Bot)",
    color: 0xc59cff,
    skin: 0xe4b79b,
    hair: 0x3a2a22,
    orgGroup: "ai_core",
    orgIndex: 1,
  },
  {
    id: "henry",
    name: "Henry (Ops Bot)",
    color: 0xff8f4c,
    skin: 0xf1cfb8,
    hair: 0x2d2019,
    orgGroup: "ai_core",
    orgIndex: 2,
  },
  {
    id: "rex",
    name: "Rex (Revenue Bot)",
    color: 0xff607b,
    skin: 0xd59b7f,
    hair: 0x1e1612,
    orgGroup: "ai_core",
    orgIndex: 3,
  },
  {
    id: "marcus",
    name: "Marcus (Data Bot)",
    color: 0x8aff9e,
    skin: 0x9f6b4f,
    hair: 0x110f0e,
    orgGroup: "ai_core",
    orgIndex: 4,
  },
];

const ORG_LAYOUT_ANCHORS = {
  executive: [new THREE.Vector3(0.8, 0, 7.8)],
  fulfillment_lead: [new THREE.Vector3(-11.4, 0, 6.9)],
  sales_ops: [
    new THREE.Vector3(-10.0, 0, 4.8),
  ],
  sales_support: [new THREE.Vector3(-7.9, 0, 4.8), new THREE.Vector3(-6.1, 0, 4.8)],
  delivery: [
    new THREE.Vector3(-10.0, 0, 1.8),
    new THREE.Vector3(-8.0, 0, 1.4),
    new THREE.Vector3(-6.0, 0, 1.8),
    new THREE.Vector3(-4.0, 0, 1.4),
  ],
  marketing: [new THREE.Vector3(1.2, 0, -1.4), new THREE.Vector3(3.6, 0, -1.9)],
  ticket_sales: [
    new THREE.Vector3(6.8, 0, -2.6),
    new THREE.Vector3(9.2, 0, -2.6),
    new THREE.Vector3(6.8, 0, -5.2),
    new THREE.Vector3(9.2, 0, -5.2),
  ],
  ai_core: [
    new THREE.Vector3(4.2, 0, 5.0),
    new THREE.Vector3(5.9, 0, 5.4),
    new THREE.Vector3(7.6, 0, 5.0),
    new THREE.Vector3(9.3, 0, 5.4),
    new THREE.Vector3(11.0, 0, 5.0),
  ],
  finance: [new THREE.Vector3(-1.2, 0, -5.2)],
};

export class AgentController {
  constructor(officeScene) {
    this.officeScene = officeScene;
    this.esaShirtTexture = this.#createEsaShirtTexture();
    this.esaBadgeTexture = this.#createEsaBadgeTexture();
    this.agents = BASE_AGENTS.map((seed, index) => this.#spawn(seed, index));
  }

  #createEsaShirtTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    // ESA shirt base: deep navy with bright center stripe.
    ctx.fillStyle = "#0b1733";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#112a56";
    ctx.fillRect(170, 0, 172, canvas.height);

    // Chest brand plate and bold ESA wordmark.
    ctx.fillStyle = "#18b9ff";
    ctx.fillRect(128, 168, 256, 144);
    ctx.fillStyle = "#041326";
    ctx.font = "bold 118px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ESA", canvas.width / 2, canvas.height / 2 + 2);

    // Simple sleeve stripes for added realism.
    ctx.fillStyle = "rgba(24, 185, 255, 0.45)";
    ctx.fillRect(0, 150, 88, 22);
    ctx.fillRect(canvas.width - 88, 150, 88, 22);
    ctx.fillRect(0, 340, 88, 22);
    ctx.fillRect(canvas.width - 88, 340, 88, 22);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  #createEsaBadgeTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#18b9ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#041326";
    ctx.font = "bold 78px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ESA", canvas.width / 2, canvas.height / 2 + 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  #makeLimb(material) {
    const limb = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.18, 4, 8), material);
    upper.position.y = -0.12;
    const lower = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.16, 4, 8), material);
    lower.position.y = -0.42;
    limb.add(upper, lower);
    return limb;
  }

  #buildHumanoid(seed) {
    const root = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: seed.skin, roughness: 0.55 });
    const clothMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      map: this.esaShirtTexture,
    });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1c2542, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: seed.hair, roughness: 0.7 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.3, 6, 10), clothMat);
    torso.position.y = 0.72;
    torso.castShadow = true;
    root.add(torso);

    // Front patch for a more legible ESA logo at office camera distance.
    const logoPatch = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.12),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: this.esaBadgeTexture,
        emissive: 0x0c2640,
        emissiveIntensity: 0.4,
        roughness: 0.45,
      })
    );
    logoPatch.position.set(0, 0.78, 0.18);
    root.add(logoPatch);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 10), skinMat);
    neck.position.y = 0.95;
    neck.castShadow = true;
    root.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 16), skinMat);
    head.position.y = 1.12;
    head.castShadow = true;
    root.add(head);

    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 16, 0, Math.PI * 2, 0, 1.8), hairMat);
    hair.position.y = 1.17;
    hair.castShadow = true;
    root.add(hair);

    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf2f6ff, roughness: 0.2 });
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x121726, roughness: 0.25 });

    const leftEyePivot = new THREE.Group();
    leftEyePivot.position.set(-0.05, 1.12, 0.138);
    const leftEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), eyeWhiteMat);
    const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), pupilMat);
    leftPupil.position.z = 0.015;
    leftEyePivot.add(leftEyeWhite, leftPupil);

    const rightEyePivot = new THREE.Group();
    rightEyePivot.position.set(0.05, 1.12, 0.138);
    const rightEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), eyeWhiteMat);
    const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 8, 8), pupilMat);
    rightPupil.position.z = 0.015;
    rightEyePivot.add(rightEyeWhite, rightPupil);

    root.add(leftEyePivot, rightEyePivot);

    const shoulderGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const leftShoulder = new THREE.Mesh(shoulderGeo, clothMat);
    leftShoulder.position.set(-0.19, 0.86, 0);
    const rightShoulder = new THREE.Mesh(shoulderGeo, clothMat);
    rightShoulder.position.set(0.19, 0.86, 0);
    root.add(leftShoulder, rightShoulder);

    const leftArm = this.#makeLimb(clothMat);
    leftArm.position.set(-0.21, 0.86, 0);
    const rightArm = this.#makeLimb(clothMat);
    rightArm.position.set(0.21, 0.86, 0);
    root.add(leftArm, rightArm);

    const leftLeg = this.#makeLimb(darkMat);
    leftLeg.position.set(-0.1, 0.5, 0);
    const rightLeg = this.#makeLimb(darkMat);
    rightLeg.position.set(0.1, 0.5, 0);
    root.add(leftLeg, rightLeg);

    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x101826, roughness: 0.5 });
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.2), shoeMat);
    leftShoe.position.set(-0.1, 0.03, 0.03);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.2), shoeMat);
    rightShoe.position.set(0.1, 0.03, 0.03);
    root.add(leftShoe, rightShoe);

    const marker = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.18, 7),
      new THREE.MeshStandardMaterial({
        color: seed.color,
        emissive: seed.color,
        emissiveIntensity: 0.4,
      })
    );
    marker.position.y = 1.44;
    marker.rotation.x = Math.PI;
    root.add(marker);

    return {
      group: root,
      rig: {
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        torso,
        head,
        leftShoulder,
        rightShoulder,
        leftEyePivot,
        rightEyePivot,
        marker,
      },
    };
  }

  #createNameTag(name, isOwner) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const fontSize = 42;
    const fontFamily = "Inter, Segoe UI, sans-serif";
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    const textWidth = Math.ceil(ctx.measureText(name).width);
    const paddingX = 28;
    const paddingY = 20;

    canvas.width = textWidth + paddingX * 2;
    canvas.height = fontSize + paddingY * 2;
    ctx.font = `700 ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "middle";

    ctx.fillStyle = isOwner ? "rgba(4, 22, 42, 0.95)" : "rgba(16, 22, 42, 0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = isOwner ? "rgba(24, 185, 255, 0.95)" : "rgba(160, 184, 255, 0.75)";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

    ctx.fillStyle = isOwner ? "#18b9ff" : "#f0f6ff";
    ctx.fillText(name, paddingX, canvas.height / 2 + 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1.7, 0.38, 1);
    sprite.position.set(0, 1.8, 0);
    return sprite;
  }

  #spawn(seed, index) {
    const { group, rig } = this.#buildHumanoid(seed);
    const orgAnchors = ORG_LAYOUT_ANCHORS[seed.orgGroup] ?? [];
    const orgAnchor = orgAnchors[seed.orgIndex] ?? orgAnchors[index % Math.max(orgAnchors.length, 1)];
    const spawnAnchor = orgAnchor
      ? orgAnchor.clone()
      : this.officeScene.getRandomAnchor(seed.homeZone ?? "transit");
    group.position.copy(spawnAnchor);
    const nameTag = this.#createNameTag(seed.name, seed.id === "brian");
    group.add(nameTag);
    this.officeScene.scene.add(group);

    const targetZone = seed.homeZone ?? (index % 2 === 0 ? "work" : "lounge");
    const initialTarget = orgAnchor ? orgAnchor.clone() : this.officeScene.getRandomAnchor(targetZone);

    return {
      ...seed,
      group,
      rig,
      nameTag,
      status: "idle",
      task: "Waiting for instruction",
      velocity: new THREE.Vector3(),
      target: initialTarget,
      speed: 1.45 + Math.random() * 0.45,
      bobOffset: Math.random() * Math.PI * 2,
      seated: false,
      gaitRate: 0.9 + Math.random() * 0.35,
      gaitSwing: 0.9 + Math.random() * 0.25,
      blinkCooldown: 1.6 + Math.random() * 2.4,
      blinkTimer: 0,
      blinkTime: 0,
      blinkDuration: 0.07 + Math.random() * 0.08,
      eyeYaw: 0,
      eyePitch: 0,
      eyeTargetYaw: 0,
      eyeTargetPitch: 0,
      eyeSaccadeTimer: 0,
      eyeSaccadeCooldown: 0.45 + Math.random() * 0.8,
      headLookYaw: 0,
      headLookPitch: 0,
      bodySwaySeed: Math.random() * Math.PI * 2,
    };
  }

  #getNearestNeighbor(agent, maxDistance = 1.6) {
    let nearest = null;
    let nearestDist = maxDistance;
    for (const other of this.agents) {
      if (other.id === agent.id) continue;
      const d = agent.group.position.distanceTo(other.group.position);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = other;
      }
    }
    return nearest;
  }

  #updateFaceTracking(agent, walking, deltaSeconds) {
    const now = performance.now() * 0.001;
    agent.eyeSaccadeTimer += deltaSeconds;
    agent.blinkTimer += deltaSeconds;

    const nearAgent = this.#getNearestNeighbor(agent, 1.4);
    let lookPoint = null;
    if (nearAgent && !walking) {
      lookPoint = nearAgent.group.position.clone();
      lookPoint.y += 1.08;
    } else if (walking && agent.velocity.lengthSq() > 0.0001) {
      lookPoint = agent.group.position.clone().add(agent.velocity.clone().normalize().multiplyScalar(1.2));
      lookPoint.y += 1.08;
    }

    if (lookPoint) {
      const localLook = agent.group.worldToLocal(lookPoint.clone());
      const yaw = Math.atan2(localLook.x, Math.max(0.01, localLook.z));
      const pitch = Math.atan2(localLook.y - 1.12, Math.max(0.01, localLook.z));
      agent.headLookYaw = THREE.MathUtils.lerp(agent.headLookYaw, THREE.MathUtils.clamp(yaw, -0.45, 0.45), 0.12);
      agent.headLookPitch = THREE.MathUtils.lerp(
        agent.headLookPitch,
        THREE.MathUtils.clamp(pitch, -0.2, 0.22),
        0.12
      );
    } else {
      agent.headLookYaw = THREE.MathUtils.lerp(agent.headLookYaw, 0, 0.08);
      agent.headLookPitch = THREE.MathUtils.lerp(agent.headLookPitch, 0, 0.08);
    }

    if (agent.eyeSaccadeTimer > agent.eyeSaccadeCooldown) {
      agent.eyeSaccadeTimer = 0;
      agent.eyeSaccadeCooldown = 0.45 + Math.random() * 0.9;
      agent.eyeTargetYaw = THREE.MathUtils.clamp(agent.headLookYaw + (Math.random() - 0.5) * 0.28, -0.28, 0.28);
      agent.eyeTargetPitch = THREE.MathUtils.clamp(
        agent.headLookPitch + (Math.random() - 0.5) * 0.2,
        -0.2,
        0.2
      );
    }

    agent.eyeYaw = THREE.MathUtils.lerp(agent.eyeYaw, agent.eyeTargetYaw, 0.18);
    agent.eyePitch = THREE.MathUtils.lerp(agent.eyePitch, agent.eyeTargetPitch, 0.18);
    agent.rig.leftEyePivot.rotation.set(agent.eyePitch, agent.eyeYaw, 0);
    agent.rig.rightEyePivot.rotation.set(agent.eyePitch, agent.eyeYaw, 0);

    if (agent.blinkTimer > agent.blinkCooldown) {
      agent.blinkTimer = 0;
      agent.blinkTime = agent.blinkDuration;
      agent.blinkCooldown = 1.6 + Math.random() * 3.1;
    }
    if (agent.blinkTime > 0) {
      agent.blinkTime = Math.max(0, agent.blinkTime - deltaSeconds);
    }
    const blinkAmount =
      agent.blinkTime > 0 ? Math.abs(Math.sin((agent.blinkTime / agent.blinkDuration) * Math.PI)) : 0;
    const eyeYScale = 1 - blinkAmount * 0.85;
    agent.rig.leftEyePivot.scale.y = eyeYScale;
    agent.rig.rightEyePivot.scale.y = eyeYScale;

    agent.rig.head.rotation.y = agent.headLookYaw;
    agent.rig.head.rotation.x = agent.headLookPitch;

    const breathe = Math.sin(now * (walking ? 1.6 : 1.05) + agent.bodySwaySeed) * (walking ? 0.012 : 0.02);
    agent.rig.torso.scale.y = 1 + breathe;
    agent.rig.leftShoulder.rotation.z = -0.06 + breathe * 1.6;
    agent.rig.rightShoulder.rotation.z = 0.06 - breathe * 1.6;
  }

  setTarget(agentId, target, status) {
    const agent = this.agents.find((item) => item.id === agentId);
    if (!agent) return;
    agent.target = target.clone();
    agent.status = status;
  }

  setTask(agentId, task) {
    const agent = this.agents.find((item) => item.id === agentId);
    if (!agent) return;
    agent.task = task;
  }

  setStatus(agentId, status) {
    const agent = this.agents.find((item) => item.id === agentId);
    if (!agent) return;
    agent.status = status;
  }

  getAgents() {
    return this.agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      status: agent.status,
      task: agent.task,
      position: agent.group.position.clone(),
    }));
  }

  update(deltaSeconds) {
    this.agents.forEach((agent) => {
      const toTarget = agent.target.clone().sub(agent.group.position);
      toTarget.y = 0;
      const distance = toTarget.length();
      const arriveRadius = 0.06;

      if (distance > arriveRadius) {
        toTarget.normalize();
        const slowRadius = 0.95;
        const approach = THREE.MathUtils.clamp(distance / slowRadius, 0.2, 1);
        agent.velocity.copy(toTarget.multiplyScalar(agent.speed * approach));
        agent.group.position.addScaledVector(agent.velocity, deltaSeconds);
        agent.seated = false;

        const lookTarget = agent.group.position.clone().add(agent.velocity);
        lookTarget.y = agent.group.position.y;
        agent.group.lookAt(lookTarget);
      } else {
        agent.velocity.set(0, 0, 0);
        const shouldSit = agent.status === "working";
        agent.seated = shouldSit;

        // At a work chair, face the desk/monitor.
        if (shouldSit) {
          const deskLookTarget = agent.group.position.clone();
          deskLookTarget.z -= 1;
          deskLookTarget.y = agent.group.position.y;
          agent.group.lookAt(deskLookTarget);
        }
      }

      const moveAmount = agent.velocity.length();
      const walking = moveAmount > 0.01;
      const stride = performance.now() * (walking ? 0.012 * agent.gaitRate : 0.004) + agent.bobOffset;
      const swing = Math.sin(stride) * (walking ? 0.55 * agent.gaitSwing : 0.08);
      const counterSwing = Math.sin(stride + Math.PI) * (walking ? 0.55 * agent.gaitSwing : 0.08);

      agent.rig.leftArm.rotation.x = swing;
      agent.rig.rightArm.rotation.x = counterSwing;
      agent.rig.leftLeg.rotation.x = counterSwing;
      agent.rig.rightLeg.rotation.x = swing;
      agent.rig.torso.rotation.z = Math.sin(stride * 0.5) * (walking ? 0.06 : 0.02);
      agent.rig.marker.material.emissiveIntensity = walking ? 0.55 : 0.25;

      if (agent.seated) {
        agent.rig.leftArm.rotation.x = -0.35;
        agent.rig.rightArm.rotation.x = -0.35;
        agent.rig.leftLeg.rotation.x = 1.2;
        agent.rig.rightLeg.rotation.x = 1.2;
        agent.rig.torso.rotation.z = 0;
        agent.rig.marker.material.emissiveIntensity = 0.35;
        agent.group.position.y = -0.16;
      } else {
        const bob = Math.sin(stride * 2) * (walking ? 0.03 : 0.01);
        agent.group.position.y = bob;
      }

      this.#updateFaceTracking(agent, walking, deltaSeconds);
    });

    // Soft separation keeps agents from stacking when paths intersect.
    const minSpacing = 0.46;
    for (let i = 0; i < this.agents.length; i += 1) {
      for (let j = i + 1; j < this.agents.length; j += 1) {
        const a = this.agents[i];
        const b = this.agents[j];
        if (a.seated && b.seated) continue;

        const delta = a.group.position.clone().sub(b.group.position);
        delta.y = 0;
        const distance = delta.length();
        if (distance <= 0.0001 || distance >= minSpacing) continue;

        const push = (minSpacing - distance) * 0.5;
        delta.normalize().multiplyScalar(push);
        a.group.position.add(delta);
        b.group.position.sub(delta);
      }
    }
  }
}
