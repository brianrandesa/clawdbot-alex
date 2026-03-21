import * as THREE from "three";

const LERP_SPEED = 8;
const COLORS = [0x7edfff, 0xffb87e, 0x7effb8, 0xff7eb8, 0xb87eff];

export class HumanAvatarController {
  constructor(officeScene) {
    this.officeScene = officeScene;
    this.avatars = new Map(); // userId -> { group, nameTag, targetPos, targetYaw }
    this.colorIndex = 0;
  }

  #buildHumanoid(color) {
    const root = new THREE.Group();
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8b896, roughness: 0.55 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x6b7a8f, roughness: 0.5 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x2a3240, roughness: 0.65 });

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.3, 6, 10), clothMat);
    torso.position.y = 0.72;
    torso.castShadow = true;
    root.add(torso);

    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 10), skinMat);
    neck.position.y = 0.95;
    root.add(neck);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 16), skinMat);
    head.position.y = 1.12;
    head.castShadow = true;
    root.add(head);

    const limbGeo = (r, h) => new THREE.Mesh(new THREE.CapsuleGeometry(r, h, 4, 8), clothMat);
    const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 4, 8), clothMat);
    leftArm.position.set(-0.21, 0.86, 0);
    const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.34, 4, 8), clothMat);
    rightArm.position.set(0.21, 0.86, 0);
    root.add(leftArm, rightArm);

    const leftLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.58, 4, 8), darkMat);
    leftLeg.position.set(-0.1, 0.5, 0);
    const rightLeg = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.58, 4, 8), darkMat);
    rightLeg.position.set(0.1, 0.5, 0);
    root.add(leftLeg, rightLeg);

    const marker = new THREE.Mesh(
      new THREE.ConeGeometry(0.1, 0.16, 7),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.5,
      })
    );
    marker.position.y = 1.42;
    marker.rotation.x = Math.PI;
    root.add(marker);

    return root;
  }

  #createNameTag(name) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const fontSize = 38;
    const fontFamily = "Inter, Segoe UI, sans-serif";
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    const textWidth = Math.ceil(ctx.measureText(name).width);
    const paddingX = 24;
    const paddingY = 18;
    canvas.width = textWidth + paddingX * 2;
    canvas.height = fontSize + paddingY * 2;
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(20, 35, 55, 0.9)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(100, 180, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    ctx.fillStyle = "#e8f4ff";
    ctx.fillText(name, paddingX, canvas.height / 2 + 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
    );
    sprite.scale.set((canvas.width / 240), (canvas.height / 240), 1);
    sprite.position.set(0, 1.72, 0);
    return sprite;
  }

  addUser(userId, displayName) {
    if (this.avatars.has(userId)) return;
    const color = COLORS[this.colorIndex % COLORS.length];
    this.colorIndex += 1;

    const group = this.#buildHumanoid(color);
    const nameTag = this.#createNameTag(displayName || "Anonymous");
    group.add(nameTag);

    const defaultPos = this.officeScene.getRandomAnchor("transit") || new THREE.Vector3(0, 0, 0);
    group.position.copy(defaultPos);

    this.officeScene.scene.add(group);
    this.avatars.set(userId, {
      group,
      nameTag,
      targetPos: defaultPos.clone(),
      targetYaw: 0,
      displayName: displayName || "Anonymous",
    });
  }

  updatePosition(userId, x, y, z, yaw = 0) {
    let avatar = this.avatars.get(userId);
    if (!avatar) return;
    avatar.targetPos.set(x, y, z);
    avatar.targetYaw = typeof yaw === "number" ? yaw : 0;
  }

  removeUser(userId) {
    const avatar = this.avatars.get(userId);
    if (!avatar) return;
    this.officeScene.scene.remove(avatar.group);
    avatar.group.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material.dispose();
      }
    });
    this.avatars.delete(userId);
  }

  update(deltaSeconds) {
    for (const [userId, avatar] of this.avatars) {
      const { group, targetPos, targetYaw } = avatar;
      group.position.lerp(targetPos, 1 - Math.exp(-LERP_SPEED * deltaSeconds));
      const currentYaw = group.rotation.y;
      const newYaw = THREE.MathUtils.lerp(currentYaw, targetYaw, 1 - Math.exp(-LERP_SPEED * deltaSeconds));
      group.rotation.y = newYaw;
    }
  }

  clear() {
    for (const userId of [...this.avatars.keys()]) {
      this.removeUser(userId);
    }
  }
}
