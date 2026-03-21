import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const ZONE_COLORS = {
  work: 0x3b4a62,
  lounge: 0x445c5b,
  meeting: 0x5a5670,
  whiteboard: 0x6c665c,
  executive: 0x5d4b49,
  fulfillment: 0x4a5f59,
  ticket_sales: 0x455f69,
  transit: 0x4c5a6d,
};

export class OfficeScene {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x10151d);

    this.camera = new THREE.PerspectiveCamera(
      55,
      containerEl.clientWidth / containerEl.clientHeight,
      0.1,
      200
    );
    this.camera.position.set(10.5, 11.5, 12.5);
    this.camera.lookAt(0.8, 0, 0.8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(containerEl.clientWidth, containerEl.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    containerEl.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.47;
    this.controls.target.set(0.8, 0, 0.8);

    this.brandLogoTexture = null;
    this.brandLogoMaterial = null;
    this.#loadBrandLogo();

    this.zones = this.#buildOffice();
  }

  #loadBrandLogo() {
    const loader = new THREE.TextureLoader();
    loader.load(
      "/logo.png",
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        this.brandLogoTexture = texture;
        if (this.brandLogoMaterial) {
          this.brandLogoMaterial.map = texture;
          this.brandLogoMaterial.color.setHex(0xffffff);
          this.brandLogoMaterial.needsUpdate = true;
        }
      },
      undefined,
      () => {
        // Keep fallback material if logo is missing.
      }
    );
  }

  #buildOffice() {
    this.#addLighting();
    this.#addFloor();

    const departmentSeatGroups = [
      {
        label: "Sales Leadership",
        seats: [
          new THREE.Vector3(-10.0, 0, 4.8),
        ],
      },
      {
        label: "Kim + Diamond",
        seats: [new THREE.Vector3(-7.9, 0, 4.8), new THREE.Vector3(-6.1, 0, 4.8)],
      },
      {
        label: "Fulfillment Internal",
        seats: [
          new THREE.Vector3(-10.0, 0, 1.8),
          new THREE.Vector3(-8.0, 0, 1.4),
          new THREE.Vector3(-6.0, 0, 1.8),
          new THREE.Vector3(-4.0, 0, 1.4),
        ],
      },
      {
        label: "Marketing",
        seats: [new THREE.Vector3(1.2, 0, -1.4), new THREE.Vector3(3.6, 0, -1.9)],
      },
      {
        label: "Ticket Sales",
        seats: [
          new THREE.Vector3(6.8, 0, -2.6),
          new THREE.Vector3(9.2, 0, -2.6),
          new THREE.Vector3(6.8, 0, -5.2),
          new THREE.Vector3(9.2, 0, -5.2),
        ],
      },
      {
        label: "Finance",
        seats: [new THREE.Vector3(-1.2, 0, -5.2)],
      },
      {
        label: "Core AI",
        seats: [
          new THREE.Vector3(4.2, 0, 5.0),
          new THREE.Vector3(5.9, 0, 5.4),
          new THREE.Vector3(7.6, 0, 5.0),
          new THREE.Vector3(9.3, 0, 5.4),
          new THREE.Vector3(11.0, 0, 5.0),
        ],
      },
    ];
    const workSeatAnchors = departmentSeatGroups.flatMap((group) => group.seats.map((s) => s.clone()));

    const zones = {
      work: {
        name: "Work Room",
        anchors: workSeatAnchors,
      },
      lounge: {
        name: "Lounge",
        anchors: [
          new THREE.Vector3(0.4, 0, 0.8),
          new THREE.Vector3(1.5, 0, -0.1),
          new THREE.Vector3(-0.9, 0, -0.2),
        ],
      },
      meeting: {
        name: "Meeting Room",
        anchors: [
          new THREE.Vector3(4.2, 0, 2.1),
          new THREE.Vector3(5.8, 0, 2.1),
          new THREE.Vector3(5.0, 0, 0.8),
          new THREE.Vector3(3.6, 0, 0.8),
        ],
      },
      whiteboard: {
        name: "Whiteboard Space",
        anchors: [
          new THREE.Vector3(-7.3, 0, -5.3),
          new THREE.Vector3(-6.6, 0, -5.9),
          new THREE.Vector3(-5.8, 0, -6.15),
          new THREE.Vector3(-5.0, 0, -6.15),
          new THREE.Vector3(-4.2, 0, -5.9),
          new THREE.Vector3(-3.5, 0, -5.3),
          new THREE.Vector3(-6.2, 0, -5.2),
          new THREE.Vector3(-4.6, 0, -5.2),
        ],
      },
      executive: {
        name: "Executive Office",
        anchors: [
          new THREE.Vector3(2.2, 0, 6.3),
          new THREE.Vector3(3.2, 0, 5.8),
          new THREE.Vector3(2.0, 0, 5.2),
          new THREE.Vector3(3.0, 0, 4.6),
          new THREE.Vector3(1.3, 0, 5.4),
        ],
      },
      fulfillment: {
        name: "Denise Fulfillment Office",
        anchors: [
          new THREE.Vector3(-9.3, 0, 5.2),
          new THREE.Vector3(-10.0, 0, 3.2),
          new THREE.Vector3(-8.8, 0, 2.8),
          new THREE.Vector3(-7.5, 0, 3.2),
          new THREE.Vector3(-8.7, 0, 4.1),
        ],
      },
      ticket_sales: {
        name: "Ticket Sales Area",
        anchors: [
          new THREE.Vector3(7.0, 0, -2.1),
          new THREE.Vector3(8.4, 0, -1.6),
          new THREE.Vector3(6.6, 0, -0.6),
          new THREE.Vector3(8.0, 0, -0.2),
          new THREE.Vector3(7.3, 0, -1.0),
        ],
      },
      transit: {
        name: "Transit Lane",
        anchors: [
          new THREE.Vector3(-2.2, 0, 3.6),
          new THREE.Vector3(0.2, 0, 3.5),
          new THREE.Vector3(2.2, 0, 2.7),
          new THREE.Vector3(3.1, 0, 0.6),
          new THREE.Vector3(2.2, 0, -1.3),
          new THREE.Vector3(0.1, 0, -2.8),
          new THREE.Vector3(6.2, 0, 0.8),
          new THREE.Vector3(4.9, 0, -0.2),
          new THREE.Vector3(2.9, 0, -1.0),
        ],
      },
    };

    this.#addZoneMesh("work", new THREE.Vector3(-3.4, 0.02, 3.0), 6.4, 4.8);
    this.#addZoneMesh("lounge", new THREE.Vector3(0.4, 0.02, 0.1), 3.8, 3.2);
    this.#addZoneMesh("meeting", new THREE.Vector3(4.7, 0.02, 1.5), 3.6, 2.8);
    this.#addZoneMesh("whiteboard", new THREE.Vector3(-5.6, 0.02, -5.4), 4.4, 2.2);
    this.#addZoneMesh("executive", new THREE.Vector3(2.4, 0.02, 5.5), 3.8, 2.8);
    this.#addZoneMesh("fulfillment", new THREE.Vector3(-8.7, 0.02, 3.9), 4.8, 4.2);
    this.#addZoneMesh("ticket_sales", new THREE.Vector3(7.3, 0.02, -1.0), 3.6, 3.0);
    this.#addZoneMesh("transit", new THREE.Vector3(0.7, 0.02, 1), 4.5, 7.6);

    this.#addDepartmentDeskPods(departmentSeatGroups);
    this.#addLoungeFurniture();
    this.#addMeetingTable();
    this.#addWhiteboardArea();
    this.#addWhiteboardCouches();
    this.#addExecutiveOffice();
    this.#addFulfillmentOffice();
    this.#addOfficePlants();
    this.#addOrgChartPods();
    this.#addMiamiWaterfront();

    return zones;
  }

  #addDepartmentDeskPods(departmentSeatGroups) {
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x7b8dad, roughness: 0.7 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x4bb2ff, roughness: 0.2 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x4b5f83, roughness: 0.65 });
    const deskGeo = new THREE.BoxGeometry(1.15, 0.16, 0.74);
    const screenGeo = new THREE.BoxGeometry(0.5, 0.34, 0.06);
    const chairSeatGeo = new THREE.BoxGeometry(0.42, 0.08, 0.42);
    const chairBackGeo = new THREE.BoxGeometry(0.42, 0.34, 0.08);
    const chairLegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.28, 8);

    departmentSeatGroups.forEach((group) => {
      group.seats.forEach((seat) => {
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.set(seat.x, 0.56, seat.z - 0.78);
        desk.castShadow = true;
        desk.receiveShadow = true;
        this.scene.add(desk);

        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(seat.x, 0.83, seat.z - 0.94);
        this.scene.add(screen);

        const chairSeat = new THREE.Mesh(chairSeatGeo, chairMat);
        chairSeat.position.set(seat.x, 0.42, seat.z);
        chairSeat.castShadow = true;
        this.scene.add(chairSeat);

        const chairBack = new THREE.Mesh(chairBackGeo, chairMat);
        chairBack.position.set(seat.x, 0.62, seat.z + 0.16);
        chairBack.castShadow = true;
        this.scene.add(chairBack);

        const legOffsets = [
          [-0.14, -0.14],
          [0.14, -0.14],
          [-0.14, 0.14],
          [0.14, 0.14],
        ];
        legOffsets.forEach(([xOffset, zOffset]) => {
          const leg = new THREE.Mesh(chairLegGeo, chairMat);
          leg.position.set(seat.x + xOffset, 0.2, seat.z + zOffset);
          this.scene.add(leg);
        });
      });
    });
  }

  #makeLabelSprite(text) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const fontSize = 42;
    ctx.font = `700 ${fontSize}px Inter, Segoe UI, sans-serif`;
    const width = Math.ceil(ctx.measureText(text).width) + 40;
    const height = fontSize + 26;
    canvas.width = width;
    canvas.height = height;
    ctx.font = `700 ${fontSize}px Inter, Segoe UI, sans-serif`;
    ctx.textBaseline = "middle";

    ctx.fillStyle = "rgba(4, 24, 46, 0.92)";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(24, 185, 255, 0.85)";
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    ctx.fillStyle = "#d9efff";
    ctx.fillText(text, 20, height / 2 + 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      })
    );
    sprite.scale.set(width / 280, height / 280, 1);
    return sprite;
  }

  #addOrgChartPods() {
    const pods = [
      { label: "Executive", center: new THREE.Vector3(3.0, 0.03, 6.2), size: [3.0, 1.8] },
      { label: "Sales Leadership", center: new THREE.Vector3(-10.0, 0.03, 4.8), size: [2.4, 1.8] },
      { label: "Kim + Diamond", center: new THREE.Vector3(-7.0, 0.03, 4.8), size: [3.4, 1.8] },
      { label: "Fulfillment Internal", center: new THREE.Vector3(-7.0, 0.03, 1.6), size: [6.8, 2.2] },
      { label: "Marketing", center: new THREE.Vector3(2.4, 0.03, -1.7), size: [3.4, 1.8] },
      { label: "Ticket Sales", center: new THREE.Vector3(8.0, 0.03, -3.9), size: [4.8, 3.4] },
      { label: "Finance", center: new THREE.Vector3(-1.2, 0.03, -5.2), size: [2.0, 1.8] },
      { label: "Core AI", center: new THREE.Vector3(7.6, 0.03, 5.2), size: [7.6, 1.8] },
    ];

    pods.forEach((pod) => {
      const zone = new THREE.Mesh(
        new THREE.PlaneGeometry(pod.size[0], pod.size[1]),
        new THREE.MeshStandardMaterial({
          color: 0x1b4f7f,
          transparent: true,
          opacity: 0.34,
          roughness: 0.85,
        })
      );
      zone.rotation.x = -Math.PI / 2;
      zone.position.copy(pod.center);
      this.scene.add(zone);

      const label = this.#makeLabelSprite(pod.label);
      label.position.set(pod.center.x, 0.42, pod.center.z - pod.size[1] * 0.5 - 0.15);
      this.scene.add(label);
    });
  }

  #addLighting() {
    const hemi = new THREE.HemisphereLight(0xc7dcff, 0x1a2135, 0.75);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(8, 14, 10);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -24;
    key.shadow.camera.right = 24;
    key.shadow.camera.top = 24;
    key.shadow.camera.bottom = -24;
    this.scene.add(key);
  }

  #addFloor() {
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x08142a, roughness: 1.0 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 18), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(26, 26, 0x18b9ff, 0x16345c);
    grid.position.y = 0.01;
    this.scene.add(grid);
  }

  #addWalls() {
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0e1f3f, roughness: 0.85 });
    const wallThickness = 0.25;
    const wallHeight = 2.6;

    const north = new THREE.Mesh(new THREE.BoxGeometry(26, wallHeight, wallThickness), wallMat);
    north.position.set(0, wallHeight / 2, -9);
    const south = north.clone();
    south.position.z = 9;
    const west = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, 18), wallMat);
    west.position.set(-13, wallHeight / 2, 0);
    const east = west.clone();
    east.position.x = 13;

    this.scene.add(north, south, west, east);
  }

  #addFulfillmentOffice() {
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x6c84a5, roughness: 0.72 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x4bb2ff, roughness: 0.2 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x3e5d84, roughness: 0.7 });

    const deniseDesk = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.16, 0.9), deskMat);
    deniseDesk.position.set(-9.3, 0.82, 4.95);
    const deniseScreen = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.36, 0.06), screenMat);
    deniseScreen.position.set(-9.3, 1.05, 4.7);
    const deniseChair = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.56), chairMat);
    deniseChair.position.set(-9.3, 0.32, 5.72);
    this.scene.add(deniseDesk, deniseScreen, deniseChair);

    const title = this.#makeLabelSprite("Denise Fulfillment Office");
    title.position.set(-8.7, 1.95, 6.0);
    this.scene.add(title);
  }

  #addZoneMesh(zoneType, center, width, depth) {
    const mat = new THREE.MeshStandardMaterial({
      color: ZONE_COLORS[zoneType],
      transparent: true,
      opacity: 0.25,
      roughness: 0.9,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), mat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.copy(center);
    this.scene.add(mesh);
  }

  #addWorkDesks(anchors, seatAnchors) {
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x7b8dad, roughness: 0.7 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x4bb2ff, roughness: 0.2 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x4b5f83, roughness: 0.65 });
    const deskGeo = new THREE.BoxGeometry(1.3, 0.18, 0.8);
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8);
    const screenGeo = new THREE.BoxGeometry(0.56, 0.38, 0.06);
    const chairSeatGeo = new THREE.BoxGeometry(0.45, 0.08, 0.45);
    const chairBackGeo = new THREE.BoxGeometry(0.45, 0.42, 0.08);
    const chairLegGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.36, 8);

    for (const anchor of anchors) {
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.set(anchor.x, 0.58, anchor.z);
      desk.castShadow = true;
      desk.receiveShadow = true;
      this.scene.add(desk);

      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(anchor.x, 0.91, anchor.z - 0.2);
      this.scene.add(screen);

      const offsets = [
        [-0.55, -0.3],
        [0.55, -0.3],
        [-0.55, 0.3],
        [0.55, 0.3],
      ];
      offsets.forEach(([xOffset, zOffset]) => {
        const leg = new THREE.Mesh(legGeo, deskMat);
        leg.position.set(anchor.x + xOffset, 0.28, anchor.z + zOffset);
        this.scene.add(leg);
      });
    }

    for (const seatAnchor of seatAnchors) {
      const chairSeat = new THREE.Mesh(chairSeatGeo, chairMat);
      chairSeat.position.set(seatAnchor.x, 0.42, seatAnchor.z);
      chairSeat.castShadow = true;
      chairSeat.receiveShadow = true;
      this.scene.add(chairSeat);

      const chairBack = new THREE.Mesh(chairBackGeo, chairMat);
      chairBack.position.set(seatAnchor.x, 0.67, seatAnchor.z + 0.18);
      chairBack.castShadow = true;
      this.scene.add(chairBack);

      const legOffsets = [
        [-0.16, -0.16],
        [0.16, -0.16],
        [-0.16, 0.16],
        [0.16, 0.16],
      ];
      legOffsets.forEach(([xOffset, zOffset]) => {
        const leg = new THREE.Mesh(chairLegGeo, chairMat);
        leg.position.set(seatAnchor.x + xOffset, 0.2, seatAnchor.z + zOffset);
        this.scene.add(leg);
      });
    }
  }

  #addLoungeFurniture() {
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x3f6ec2, roughness: 0.7 });
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x8ca2be, roughness: 0.7 });

    const sofa1 = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.7, 0.9), sofaMat);
    sofa1.position.set(-0.5, 0.35, 0.95);
    const sofa2 = sofa1.clone();
    sofa2.position.set(1.35, 0.35, -0.1);
    sofa2.rotation.y = Math.PI / 2;
    const coffeeTable = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.25, 0.9), tableMat);
    coffeeTable.position.set(0.35, 0.25, 0.35);

    this.scene.add(sofa1, sofa2, coffeeTable);
  }

  #addMeetingTable() {
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x6b7f9d, roughness: 0.7 });
    const chairMat = new THREE.MeshStandardMaterial({ color: 0x40567b, roughness: 0.8 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 1.2), tableMat);
    table.position.set(4.7, 0.6, 1.5);
    this.scene.add(table);

    const chairGeo = new THREE.BoxGeometry(0.45, 0.7, 0.45);
    const chairOffsets = [
      [3.6, 1.5],
      [5.8, 1.5],
      [4.7, 0.45],
      [4.7, 2.55],
    ];
    chairOffsets.forEach(([x, z]) => {
      const chair = new THREE.Mesh(chairGeo, chairMat);
      chair.position.set(x, 0.35, z);
      this.scene.add(chair);
    });
  }

  #addWhiteboardArea() {
    const boardFrameMat = new THREE.MeshStandardMaterial({ color: 0x5c4a2b, roughness: 0.75 });
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f2, roughness: 0.85 });
    const markerMat = new THREE.MeshStandardMaterial({ color: 0x2c3f66, roughness: 0.35 });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.9, 1.8, 0.08), boardFrameMat);
    frame.position.set(-5.6, 1.5, -7.72);
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.55, 1.45, 0.05), boardMat);
    board.position.set(-5.6, 1.5, -7.66);
    this.scene.add(frame, board);

    const markerTray = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.12), boardFrameMat);
    markerTray.position.set(-5.6, 0.67, -7.62);
    this.scene.add(markerTray);

    const marker1 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 10), markerMat);
    marker1.rotation.z = Math.PI / 2;
    marker1.position.set(-5.95, 0.72, -7.58);
    const marker2 = marker1.clone();
    marker2.position.x = -5.7;
    const marker3 = marker1.clone();
    marker3.position.x = -5.45;
    this.scene.add(marker1, marker2, marker3);
  }

  #addWhiteboardCouches() {
    const couchMat = new THREE.MeshStandardMaterial({ color: 0x4f6689, roughness: 0.72 });
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0x6686b3, roughness: 0.62 });
    const legMat = new THREE.MeshStandardMaterial({ color: 0x2b3648, roughness: 0.78 });

    const createCouch = (x, z, rotationY = 0) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.rotation.y = rotationY;

      const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.26, 0.7), couchMat);
      base.position.set(0, 0.32, 0);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.45, 0.12), couchMat);
      back.position.set(0, 0.58, -0.28);
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.12, 0.58), cushionMat);
      seat.position.set(0, 0.46, 0.03);
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.32, 0.62), couchMat);
      armL.position.set(-0.74, 0.5, -0.01);
      const armR = armL.clone();
      armR.position.x = 0.74;

      const legGeo = new THREE.BoxGeometry(0.08, 0.16, 0.08);
      const legOffsets = [
        [-0.65, -0.24],
        [0.65, -0.24],
        [-0.65, 0.24],
        [0.65, 0.24],
      ];
      legOffsets.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.12, lz);
        group.add(leg);
      });

      group.add(base, back, seat, armL, armR);
      this.scene.add(group);
    };

    // Lounge ring around whiteboard for sit-down brainstorm sessions.
    createCouch(-7.0, -4.95, 2.66);
    createCouch(-5.6, -4.65, Math.PI);
    createCouch(-4.2, -4.95, -2.66);
    createCouch(-7.2, -5.95, 2.39);
    createCouch(-4.0, -5.95, -2.39);
  }

  #addExecutiveOffice() {
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x2c343f, roughness: 0.7 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: 0x161d26, roughness: 0.75 });
    const rugMat = new THREE.MeshStandardMaterial({ color: 0x1f2d3f, roughness: 0.92 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0x66a3ff, roughness: 0.35 });
    const plantPotMat = new THREE.MeshStandardMaterial({ color: 0x5f5a54, roughness: 0.78 });
    const plantLeafMat = new THREE.MeshStandardMaterial({ color: 0x53836b, roughness: 0.68 });

    const roomCenter = new THREE.Vector3(2.4, 0, 5.5);
    const roomWidth = 5.4;
    const roomDepth = 4.3;
    const roomFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(roomWidth, roomDepth),
      new THREE.MeshStandardMaterial({ color: 0x081a37, roughness: 1.0 })
    );
    roomFloor.rotation.x = -Math.PI / 2;
    roomFloor.position.set(roomCenter.x, 0.025, roomCenter.z);
    this.scene.add(roomFloor);

    // One large CEO desk, no extra desks in the office.
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.18, 1.35), woodMat);
    deskTop.position.set(2.5, 0.84, 4.35);
    const deskLegGeo = new THREE.BoxGeometry(0.16, 0.72, 0.16);
    const deskLegOffsets = [
      [-1.3, -0.56],
      [1.3, -0.56],
      [-1.3, 0.56],
      [1.3, 0.56],
    ];
    this.scene.add(deskTop);
    deskLegOffsets.forEach(([xOffset, zOffset]) => {
      const leg = new THREE.Mesh(deskLegGeo, darkWoodMat);
      leg.position.set(deskTop.position.x + xOffset, 0.4, deskTop.position.z + zOffset);
      this.scene.add(leg);
    });

    const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.54, 0.08), accentMat);
    monitor.position.set(2.5, 1.18, 3.95);
    this.scene.add(monitor);

    const execChair = new THREE.Group();
    const execSeat = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.75), darkWoodMat);
    execSeat.position.set(2.5, 0.52, 5.3);
    const execBack = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.12), darkWoodMat);
    execBack.position.set(2.5, 0.93, 5.6);
    execChair.add(execSeat, execBack);
    this.scene.add(execChair);

    // Relaxing lounge chairs for a calm executive feel.
    const loungeSeatMat = new THREE.MeshStandardMaterial({ color: 0x4f5f70, roughness: 0.72 });
    const loungeSeatGeo = new THREE.BoxGeometry(0.76, 0.16, 0.76);
    const loungeBackGeo = new THREE.BoxGeometry(0.76, 0.48, 0.12);
    const loungeArmsGeo = new THREE.BoxGeometry(0.1, 0.28, 0.62);
    const loungeCenters = [
      new THREE.Vector3(1.25, 0.5, 6.05),
      new THREE.Vector3(3.75, 0.5, 6.05),
    ];
    loungeCenters.forEach((center) => {
      const seat = new THREE.Mesh(loungeSeatGeo, loungeSeatMat);
      seat.position.copy(center);
      const back = new THREE.Mesh(loungeBackGeo, loungeSeatMat);
      back.position.set(center.x, center.y + 0.24, center.z - 0.32);
      const armL = new THREE.Mesh(loungeArmsGeo, loungeSeatMat);
      armL.position.set(center.x - 0.34, center.y + 0.1, center.z);
      const armR = new THREE.Mesh(loungeArmsGeo, loungeSeatMat);
      armR.position.set(center.x + 0.34, center.y + 0.1, center.z);
      this.scene.add(seat, back, armL, armR);
    });

    const sideTable = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.34, 18), woodMat);
    sideTable.position.set(2.5, 0.2, 6.02);
    this.scene.add(sideTable);

    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.4), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(2.4, 0.03, 5.2);
    this.scene.add(rug);

    const sofa = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.65, 0.86), woodMat);
    sofa.position.set(4.45, 0.34, 5.7);
    const coffee = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.23, 0.55), darkWoodMat);
    coffee.position.set(3.8, 0.2, 5.7);
    this.scene.add(sofa, coffee);

    const plantPot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.34, 14), plantPotMat);
    plantPot.position.set(4.95, 0.17, 6.45);
    const plantLeaf = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.9, 10), plantLeafMat);
    plantLeaf.position.set(4.95, 0.8, 6.45);
    this.scene.add(plantPot, plantLeaf);

    const logoPanelGeo = new THREE.PlaneGeometry(2.2, 0.78);
    this.brandLogoMaterial = new THREE.MeshStandardMaterial({
      color: 0x66a3ff,
      roughness: 0.3,
      emissive: 0x16253b,
      emissiveIntensity: 0.22,
    });
    if (this.brandLogoTexture) {
      this.brandLogoMaterial.map = this.brandLogoTexture;
      this.brandLogoMaterial.color.setHex(0xffffff);
    }

    const logoPanel = new THREE.Mesh(logoPanelGeo, this.brandLogoMaterial);
    logoPanel.position.set(2.4, 1.62, 3.46);
    this.scene.add(logoPanel);
  }

  #addOfficePlants() {
    const potMat = new THREE.MeshStandardMaterial({ color: 0x5f5a54, roughness: 0.8 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3f5f4c, roughness: 0.7 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5c9376, roughness: 0.68 });

    const createLargePlant = (x, z, scale = 1) => {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);

      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.4, 14), potMat);
      pot.position.y = 0.2;
      group.add(pot);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.95, 10), stemMat);
      stem.position.y = 0.88;
      group.add(stem);

      const leafOffsets = [
        [0.0, 1.2, 0.0],
        [0.18, 1.0, 0.08],
        [-0.2, 1.04, 0.06],
        [0.12, 1.08, -0.12],
        [-0.14, 1.16, -0.1],
      ];
      leafOffsets.forEach(([lx, ly, lz], idx) => {
        const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), leafMat);
        leaf.position.set(lx, ly, lz);
        leaf.scale.set(1 + idx * 0.06, 0.85 + idx * 0.03, 1);
        group.add(leaf);
      });

      this.scene.add(group);
    };

    createLargePlant(-11.5, 6.6, 1.25);
    createLargePlant(-9.8, -6.9, 1.18);
    createLargePlant(-2.2, -6.8, 1.12);
    createLargePlant(3.8, -6.6, 1.22);
    createLargePlant(10.8, -1.0, 1.2);
    createLargePlant(11.2, 6.4, 1.2);
  }

  #addMiamiWaterfront() {
    // Water strip outside the north wall.
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 7.5),
      new THREE.MeshStandardMaterial({
        color: 0x15395f,
        roughness: 0.25,
        metalness: 0.45,
        transparent: true,
        opacity: 0.86,
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.015, -12.8);
    this.scene.add(water);

    // Skyline silhouette.
    const skylineMat = new THREE.MeshStandardMaterial({ color: 0x1e2a3b, roughness: 0.88 });
    const glowMat = new THREE.MeshStandardMaterial({
      color: 0x66a3ff,
      emissive: 0x1f4b7e,
      emissiveIntensity: 0.35,
      roughness: 0.4,
    });
    const xPositions = [-13.5, -11.2, -9.0, -6.8, -4.2, -2.0, 0.5, 3.0, 5.2, 7.6, 10.0, 12.4];
    const heights = [3.6, 4.8, 6.2, 4.2, 5.9, 7.1, 4.9, 6.6, 5.0, 6.1, 4.4, 5.3];
    xPositions.forEach((x, idx) => {
      const h = heights[idx];
      const tower = new THREE.Mesh(new THREE.BoxGeometry(1.2, h, 1.0), skylineMat);
      tower.position.set(x, h / 2 + 0.2, -15.2 + (idx % 2 === 0 ? 0.25 : -0.25));
      this.scene.add(tower);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.08, 1.04), glowMat);
      cap.position.set(tower.position.x, tower.position.y + h / 2 + 0.04, tower.position.z);
      this.scene.add(cap);
    });

    const horizonGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 3.5),
      new THREE.MeshStandardMaterial({
        color: 0x8bb6e8,
        emissive: 0x3c6d9f,
        emissiveIntensity: 0.4,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      })
    );
    horizonGlow.position.set(0, 2.9, -14.4);
    this.scene.add(horizonGlow);

    this.#addYacht();
  }

  #addYacht() {
    const hullMat = new THREE.MeshStandardMaterial({ color: 0xe9f2ff, roughness: 0.55 });
    const darkHullMat = new THREE.MeshStandardMaterial({ color: 0x2b4569, roughness: 0.62 });
    const deckMat = new THREE.MeshStandardMaterial({ color: 0xd8e6f7, roughness: 0.45 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x99c9ff,
      transparent: true,
      opacity: 0.5,
      roughness: 0.18,
      metalness: 0.1,
    });

    const yacht = new THREE.Group();
    yacht.position.set(8.8, 0.06, -12.7);
    yacht.rotation.y = -0.28;

    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 1.12), hullMat);
    hull.position.set(0, 0.36, 0);
    const hullBottom = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.32, 0.82), darkHullMat);
    hullBottom.position.set(0, 0.14, 0);
    const bow = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.9, 10), hullMat);
    bow.rotation.z = Math.PI / 2;
    bow.position.set(1.95, 0.36, 0);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.9), deckMat);
    deck.position.set(-0.28, 0.67, 0);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.44, 0.62), hullMat);
    cabin.position.set(-0.45, 0.95, 0);
    const cabinGlass = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.24, 0.58), glassMat);
    cabinGlass.position.set(-0.42, 1.02, 0.02);

    const radarPole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 8), darkHullMat);
    radarPole.position.set(-0.9, 1.34, 0);
    const radar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.04, 0.1), darkHullMat);
    radar.position.set(-0.9, 1.56, 0);

    yacht.add(hull, hullBottom, bow, deck, cabin, cabinGlass, radarPole, radar);
    this.scene.add(yacht);
  }

  getRandomAnchor(zoneName) {
    const zone = this.zones[zoneName];
    if (!zone || zone.anchors.length === 0) {
      return new THREE.Vector3(0, 0, 0);
    }
    const index = Math.floor(Math.random() * zone.anchors.length);
    return zone.anchors[index].clone();
  }

  getZoneAnchors(zoneName) {
    const zone = this.zones[zoneName];
    if (!zone || !Array.isArray(zone.anchors)) {
      return [];
    }
    return zone.anchors.map((anchor) => anchor.clone());
  }

  update() {
    this.controls.update();
  }

  resize() {
    const width = this.containerEl.clientWidth;
    const height = this.containerEl.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
