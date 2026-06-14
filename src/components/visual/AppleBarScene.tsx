import React from 'react';
import * as THREE from 'three';

export function AppleBarScene() {
  const mountRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 1.25, 7.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const gold = new THREE.MeshPhysicalMaterial({
      color: 0xd8b75a,
      metalness: 0.7,
      roughness: 0.23,
      clearcoat: 0.55,
      clearcoatRoughness: 0.18,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x101827,
      metalness: 0.08,
      roughness: 0.08,
      transmission: 0.42,
      thickness: 0.6,
      transparent: true,
      opacity: 0.58,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    const redGlass = new THREE.MeshPhysicalMaterial({
      color: 0x8c1018,
      emissive: 0x390006,
      emissiveIntensity: 0.45,
      metalness: 0.1,
      roughness: 0.18,
      transparent: true,
      opacity: 0.7,
      clearcoat: 0.7,
    });
    const dark = new THREE.MeshStandardMaterial({
      color: 0x080b12,
      metalness: 0.55,
      roughness: 0.36,
    });

    const makeBlock = (w: number, h: number, d: number, material: THREE.Material, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      group.add(mesh);
      return mesh;
    };

    const base = makeBlock(5.8, 0.16, 2.2, dark, 0, -1.25, 0);
    base.rotation.x = -0.06;
    const counterFront = makeBlock(5.4, 0.05, 0.08, gold, 0, -1.1, 1.16);
    const mainPanel = makeBlock(3.3, 2.05, 0.08, glass, -0.55, 0.1, -0.45);
    mainPanel.rotation.y = -0.18;
    mainPanel.rotation.x = -0.04;
    const sidePanel = makeBlock(1.55, 1.35, 0.08, glass, 1.62, -0.06, 0.02);
    sidePanel.rotation.y = 0.24;
    const redPanel = makeBlock(0.78, 1.58, 0.1, redGlass, -2.12, -0.1, 0.05);
    redPanel.rotation.y = -0.28;

    const railGeometry = new THREE.BoxGeometry(0.04, 1.85, 0.04);
    [-1.95, -0.55, 0.86, 1.72].forEach((x, index) => {
      const rail = new THREE.Mesh(railGeometry, index % 2 === 0 ? gold : redGlass);
      rail.position.set(x, -0.05, 0.32 + index * 0.02);
      rail.rotation.z = index % 2 === 0 ? -0.16 : 0.12;
      group.add(rail);
    });

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.74, 0.026, 20, 96),
      gold,
    );
    ring.position.set(0.62, 0.15, 0.18);
    ring.rotation.set(1.2, 0.22, 0.04);
    group.add(ring);

    const stripMaterial = new THREE.MeshBasicMaterial({ color: 0xf8e7a2 });
    for (let i = 0; i < 6; i += 1) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.018, 0.018), stripMaterial);
      strip.position.set(-1.42 + i * 0.48, 0.9 - i * 0.08, 0.18);
      strip.rotation.z = -0.16;
      group.add(strip);
    }

    const redLight = new THREE.PointLight(0xff263c, 7, 9);
    redLight.position.set(-3.5, 1.2, 2.4);
    scene.add(redLight);
    const goldLight = new THREE.PointLight(0xffd36a, 8, 9);
    goldLight.position.set(2.7, 2.6, 2.8);
    scene.add(goldLight);
    scene.add(new THREE.AmbientLight(0x8aa7ff, 0.52));

    const pointer = new THREE.Vector2(0, 0);
    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    const resize = () => {
      const width = mount.clientWidth || window.innerWidth;
      const height = mount.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize);

    let raf = 0;
    const startedAt = window.performance.now();
    const animate = () => {
      const elapsed = (window.performance.now() - startedAt) / 1000;
      group.rotation.y += ((pointer.x * 0.08) - group.rotation.y) * 0.035;
      group.rotation.x += ((-pointer.y * 0.035) - group.rotation.x) * 0.035;
      ring.rotation.z = elapsed * 0.18;
      mainPanel.position.y = 0.1 + Math.sin(elapsed * 0.75) * 0.035;
      sidePanel.position.y = -0.06 + Math.sin(elapsed * 0.82 + 1.4) * 0.026;
      redLight.intensity = 6.4 + Math.sin(elapsed * 1.7) * 0.75;
      goldLight.intensity = 7.6 + Math.sin(elapsed * 1.15 + 0.8) * 0.55;
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach(material => material.dispose());
        }
      });
    };
  }, []);

  return <div ref={mountRef} className="apple-3d-stage" aria-hidden="true" />;
}
