    import * as THREE from 'three';
    import { OrbitControls } from "three/addons/controls/OrbitControls.js";
      
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.0015);
      
      const camera = new THREE.PerspectiveCamera(
        75, window.innerWidth / window.innerHeight, 0.1, 1000
      );
      camera.position.set(0, 5, 10);
      
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      document.getElementById('container').appendChild(renderer.domElement);
      
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.2;
      
      function createGlowMaterial(color, size = 128) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const context = canvas.getContext('2d');
        const gradient = context.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(214, 46, 46, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({
          map: texture,
          transparent: true,
          blending: THREE.AdditiveBlending
        });
        return new THREE.Sprite(material);
      }
      
      const centralGlow = createGlowMaterial('rgba(255,255,255,0.8)', 256);
      centralGlow.scale.set(8, 8, 1);
      scene.add(centralGlow);
      
      for (let i = 0; i < 15; i++) {
        const hue = Math.random() * 360;
        const color = `hsla(${hue}, 80%, 50%, 0.5)`;
        const nebula = createGlowMaterial(color, 256);
        nebula.scale.set(10 + Math.random() * 20, 10 + Math.random() * 20, 1);
        nebula.position.set(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        );
        scene.add(nebula);
      }
      
      const galaxyParameters = {
        count: 100000,
        arms: 4,
        radius: 10,
        spin: 2,
        randomness: 0.3,
        randomnessPower: 3,
        insideColor: new THREE.Color(0xff66ff),
        outsideColor: new THREE.Color(0x66ffff)
      };
      
      const positions = new Float32Array(galaxyParameters.count * 3);
      const colors = new Float32Array(galaxyParameters.count * 3);
      
      for (let i = 0; i < galaxyParameters.count; i++) {
        const i3 = i * 3;
        const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
        const branchAngle = ((i % galaxyParameters.arms) / galaxyParameters.arms) * Math.PI * 2;
        const spinAngle = radius * galaxyParameters.spin;
        const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
        const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 0.5;
        const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
        const totalAngle = branchAngle + spinAngle;
        
        positions[i3]     = Math.cos(totalAngle) * radius + randomX;
        positions[i3 + 1] = randomY;
        positions[i3 + 2] = Math.sin(totalAngle) * radius + randomZ;
        
        const mixedColor = galaxyParameters.insideColor.clone();
        mixedColor.lerp(galaxyParameters.outsideColor, radius / galaxyParameters.radius);
        mixedColor.multiplyScalar(0.7 + 0.3 * Math.random());
        
        colors[i3]     = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;
      }
      
      const galaxyGeometry = new THREE.BufferGeometry();
      galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const galaxyMaterial = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      
      const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
      scene.add(galaxy);
      
      const starGeometry = new THREE.BufferGeometry();
      const starCount = 5000;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        starPositions[i * 3] = (Math.random() - 0.5) * 400;
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 400;
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      }
      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.5,
        sizeAttenuation: true,
        transparent: true
      });
      
      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
      
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
      scene.add(ambientLight);
      
      function animate() {
        requestAnimationFrame(animate);
        
        controls.update();
        
        galaxy.rotation.y += 0.0005;
        stars.rotation.y += 0.0002;
        
        renderer.render(scene, camera);
      }
      
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
      
      animate();
     