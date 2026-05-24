document.addEventListener('DOMContentLoaded', () => {

  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');

  if (window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0, fX = 0, fY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursor.style.left = mouseX + 'px'; cursor.style.top = mouseY + 'px';
    });
    function followCursor() {
      fX += (mouseX - fX) * 0.12; fY += (mouseY - fY) * 0.12;
      cursorFollower.style.left = fX + 'px'; cursorFollower.style.top = fY + 'px';
      requestAnimationFrame(followCursor);
    }
    followCursor();
    document.querySelectorAll('a, button, .work-card-inner').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); cursorFollower.classList.add('hover'); });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); cursorFollower.classList.remove('hover'); });
    });
  }

  // ─── Three.js Scene ───
  (function initThree() {
    const canvas = document.getElementById('threeCanvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    camera.position.z = 14;

    const ambient = new THREE.AmbientLight(0x303050); scene.add(ambient);
    const dl = new THREE.DirectionalLight(0xa855f7, 1.0); dl.position.set(2, 3, 4); scene.add(dl);
    const dl2 = new THREE.DirectionalLight(0x3b82f6, 0.6); dl2.position.set(-3, -1, 2); scene.add(dl2);

    // Blender logo ring
    (function createBlenderLogo() {
      const group = new THREE.Group();
      const points = [];
      const segments = 60;
      const gapAngle = Math.PI / 6;
      const radius = 1.8;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI * 2 - Math.PI / 2;
        if (angle > Math.PI * 2 - gapAngle) continue;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
      }
      if (points.length > 2) {
        const curve = new THREE.CatmullRomCurve3(points, true);
        const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 8, true);
        const tubeMat = new THREE.MeshPhysicalMaterial({
          color: 0xf57900, emissive: 0xf57900, emissiveIntensity: 0.15,
          metalness: 0.4, roughness: 0.3, transparent: true, opacity: 0.7,
        });
        const ring = new THREE.Mesh(tubeGeo, tubeMat);
        ring.rotation.x = Math.PI * 0.3; ring.rotation.z = 0.2;
        group.add(ring);
      }
      const innerPoints = [];
      const innerRadius = 1.2;
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const angle = t * Math.PI * 2;
        innerPoints.push(new THREE.Vector3(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius, 0));
      }
      const innerCurve = new THREE.CatmullRomCurve3(innerPoints, true);
      const innerTube = new THREE.TubeGeometry(innerCurve, 40, 0.06, 6, true);
      const innerMat = new THREE.MeshPhysicalMaterial({
        color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.1,
        metalness: 0.3, roughness: 0.2, transparent: true, opacity: 0.5,
      });
      const innerRing = new THREE.Mesh(innerTube, innerMat);
      innerRing.rotation.x = Math.PI * 0.3; innerRing.rotation.z = 0.2;
      group.add(innerRing);

      group.position.set(3.5, 1.8, -3);
      scene.add(group);
      window.__logoGroup = group;
    })();

    // Cube with wireframe
    (function createPrimitiveCube() {
      const group = new THREE.Group();
      const cubeGeo = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      const cubeMat = new THREE.MeshPhysicalMaterial({
        color: 0x3b82f6, metalness: 0.2, roughness: 0.4, transparent: true, opacity: 0.25,
      });
      const cube = new THREE.Mesh(cubeGeo, cubeMat); group.add(cube);

      const edges = new THREE.EdgesGeometry(cubeGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.7 });
      group.add(new THREE.LineSegments(edges, lineMat));

      const vertPos = [[-0.6,-0.6,-0.6],[0.6,-0.6,-0.6],[0.6,0.6,-0.6],[-0.6,0.6,-0.6],[-0.6,-0.6,0.6],[0.6,-0.6,0.6],[0.6,0.6,0.6],[-0.6,0.6,0.6]];
      const dotMat = new THREE.MeshPhysicalMaterial({ color: 0xf57900, emissive: 0xf57900, emissiveIntensity: 0.5, metalness: 0.1, roughness: 0.2 });
      vertPos.forEach(p => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), dotMat); d.position.set(p[0], p[1], p[2]); group.add(d); });

      group.position.set(-3, -0.5, -2);
      scene.add(group);
      window.__cubePrim = group;
    })();

    // UV Sphere
    (function createPrimitiveSphere() {
      const group = new THREE.Group();
      const sphereGeo = new THREE.SphereGeometry(0.9, 24, 16);
      const sphereMat = new THREE.MeshPhysicalMaterial({ color: 0xec4899, metalness: 0.1, roughness: 0.3, transparent: true, opacity: 0.15 });
      group.add(new THREE.Mesh(sphereGeo, sphereMat));
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xf472b6, wireframe: true, transparent: true, opacity: 0.4 });
      group.add(new THREE.Mesh(sphereGeo.clone(), wireMat));
      group.position.set(-4.5, 1.5, -4);
      scene.add(group);
      window.__spherePrim = group;
    })();

    // Monkey (Suzanne)
    (function createMonkey() {
      const group = new THREE.Group();
      const headGeo = new THREE.SphereGeometry(0.7, 16, 16);
      const headMat = new THREE.MeshPhysicalMaterial({ color: 0xa855f7, metalness: 0.2, roughness: 0.5, transparent: true, opacity: 0.3 });
      const head = new THREE.Mesh(headGeo, headMat); head.scale.y = 0.85; group.add(head);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.4 });
      const wireHead = new THREE.Mesh(headGeo.clone(), wireMat); wireHead.scale.y = 0.85; group.add(wireHead);
      const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x1a1a2e, metalness: 0.1, roughness: 0.8 });
      [-0.25, 0.25].forEach(x => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), eyeMat); e.position.set(x, 0.1, 0.65); group.add(e); });
      group.position.set(4.2, -1.5, -3); group.scale.setScalar(0.9);
      scene.add(group);
      window.__monkey = group;
    })();

    // Grid floor
    (function createGrid() {
      const group = new THREE.Group();
      const gridSize = 20, divisions = 30, step = gridSize / divisions;
      const mat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.06 });
      for (let i = -divisions / 2; i <= divisions / 2; i++) {
        const p = i * step;
        const g1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-gridSize / 2, -3.5, p), new THREE.Vector3(gridSize / 2, -3.5, p)]);
        group.add(new THREE.Line(g1, mat));
        const g2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(p, -3.5, -gridSize / 2), new THREE.Vector3(p, -3.5, gridSize / 2)]);
        group.add(new THREE.Line(g2, mat));
      }
      const axX = new THREE.LineBasicMaterial({ color: 0xf57900, transparent: true, opacity: 0.15 });
      const axZ = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.15 });
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-gridSize / 2, -3.5, 0), new THREE.Vector3(gridSize / 2, -3.5, 0)]), axX));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, -3.5, -gridSize / 2), new THREE.Vector3(0, -3.5, gridSize / 2)]), axZ));
      scene.add(group);
    })();

    // Particles
    const vCount = 200;
    const vPos = new Float32Array(vCount * 3);
    const vColors = new Float32Array(vCount * 3);
    for (let i = 0; i < vCount; i++) {
      vPos[i*3] = (Math.random() - 0.5) * 30;
      vPos[i*3+1] = (Math.random() - 0.5) * 12;
      vPos[i*3+2] = (Math.random() - 0.5) * 15 - 2;
      const c = Math.random() > 0.5 ? 0xf57900 : 0x7c3aed;
      vColors[i*3] = ((c>>16)&255)/255;
      vColors[i*3+1] = ((c>>8)&255)/255;
      vColors[i*3+2] = (c&255)/255;
    }
    const ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(vPos, 3));
    ptGeo.setAttribute('color', new THREE.BufferAttribute(vColors, 3));
    const ptMat = new THREE.PointsMaterial({ size: 0.05, vertexColors: true, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(ptGeo, ptMat);
    scene.add(particles);
    window.__particles = particles;

    // Work images
    const textureLoader = new THREE.TextureLoader();
    const planes = [];
    const targetPositions = [];
    for (let i = 1; i <= 6; i++) {
      const path = 'img/' + i + '.png';
      const idx = i - 1;
      textureLoader.load(path,
        (texture) => {
          const aspect = texture.image ? texture.image.width / texture.image.height : 1;
          const w = 1.8, h = w / aspect;
          const geo = new THREE.PlaneGeometry(w, h);
          const mat = new THREE.MeshPhysicalMaterial({ map: texture, transparent: true, side: THREE.DoubleSide, roughness: 0.15, metalness: 0, depthWrite: false });
          const mesh = new THREE.Mesh(geo, mat);
          const angle = (idx / 6) * Math.PI * 2 + Math.PI / 4;
          const radius = 5.5;
          const x = Math.cos(angle) * radius;
          const y = (Math.random() - 0.5) * 2.5;
          const z = -2 - Math.random() * 2;
          mesh.position.set(x, y, z);
          mesh.rotation.y = -angle;
          scene.add(mesh);
          planes.push(mesh);
          targetPositions.push({ x, y, z });
        },
        undefined,
        function() {} // error silently
      );
    }
    window.__planes = planes;
    window.__targetPos = targetPositions;

    // Mouse + scroll
    let mx = 0, my = 0, scrollY = 0;
    document.addEventListener('mousemove', (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; });
    window.addEventListener('scroll', () => { scrollY = pageYOffset / (document.body.scrollHeight - innerHeight); });
    window.addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });

    function animate() {
      requestAnimationFrame(animate);
      const t = Date.now() * 0.0003;

      const lg = window.__logoGroup;
      if (lg) {
        lg.position.x = 3.5 + mx * 0.4; lg.position.y = 1.8 + my * 0.3;
        lg.rotation.y = Math.sin(t * 0.3) * 0.2;
        lg.rotation.x = Math.PI * 0.3 + Math.sin(t * 0.2) * 0.05;
      }

      const cp = window.__cubePrim;
      if (cp) {
        cp.position.x = -3 + mx * 0.3; cp.position.y = -0.5 + my * 0.2;
        cp.rotation.x = t * 0.5; cp.rotation.y = t * 0.7;
      }

      const sp = window.__spherePrim;
      if (sp) {
        sp.position.x = -4.5 + mx * 0.3; sp.position.y = 1.5 + my * 0.25;
        sp.rotation.x = t * 0.4; sp.rotation.y = t * 0.6;
        sp.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
      }

      const mk = window.__monkey;
      if (mk) {
        mk.position.x = 4.2 + mx * 0.3; mk.position.y = -1.5 + my * 0.2;
        mk.rotation.y = Math.sin(t * 0.5) * 0.3; mk.rotation.z = Math.sin(t * 0.3) * 0.05;
      }

      const pl = window.__planes;
      const tp = window.__targetPos;
      if (pl && tp) {
        pl.forEach((mesh, i) => {
          if (tp[i]) {
            const bp = tp[i];
            mesh.position.x = bp.x + mx * 0.6 + Math.sin(t + i * 1.7) * 0.3;
            mesh.position.y = bp.y + my * 0.4 + Math.cos(t * 0.7 + i * 2.3) * 0.4;
            mesh.position.z = bp.z + Math.sin(t * 0.5 + i * 3.1) * 0.5 - scrollY * 2;
            mesh.rotation.y = Math.sin(t * 0.4 + i * 1.1) * 0.15 - mx * 0.1;
            mesh.rotation.x = Math.sin(t * 0.3 + i * 1.9) * 0.05 + my * 0.05;
          }
        });
      }

      const pt = window.__particles;
      if (pt) { pt.rotation.y = t * 0.04; pt.rotation.x = Math.sin(t * 0.02) * 0.05; }

      camera.position.z = 14 - scrollY * 2;
      camera.position.y = -scrollY * 0.4;

      renderer.render(scene, camera);
    }
    animate();
  })();

  // Navbar
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => { navbar.classList.toggle('scrolled', pageYOffset > 50); });

  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  hamburger.addEventListener('click', () => { hamburger.classList.toggle('active'); navLinks.classList.toggle('active'); });
  document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => { hamburger.classList.remove('active'); navLinks.classList.remove('active'); }));

  // Active nav
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => { if (pageYOffset >= s.offsetTop - 150) current = s.id; });
    document.querySelectorAll('.nav-links a').forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
  });

  // 3D Tilt
  document.querySelectorAll('.work-card-inner').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (innerWidth < 768) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(1000px) translateY(-6px) rotateX(' + (y * -8) + 'deg) rotateY(' + (x * 8) + 'deg) scale3d(1.02,1.02,1.02)';
      card.style.boxShadow = (x * 20) + 'px ' + (y * 20) + 'px 60px rgba(124,58,237,0.15), 0 20px 60px rgba(0,0,0,0.3)';
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const cards = document.querySelectorAll('.work-card-inner');
  let currentIdx = 0;

  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img && img.src) { currentIdx = i; lightboxImg.src = img.src; lightboxImg.alt = img.alt; lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; }
    });
  });

  function closeLB() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
  function navLB(dir) {
    const valid = [];
    cards.forEach((c, i) => { const img = c.querySelector('img'); if (img && img.complete && img.naturalWidth > 0) valid.push(i); });
    if (!valid.length) return;
    let pos = valid.indexOf(currentIdx); if (pos === -1) pos = 0;
    pos = (pos + dir + valid.length) % valid.length;
    currentIdx = valid[pos];
    const img = cards[currentIdx].querySelector('img');
    if (img) { lightboxImg.src = img.src; lightboxImg.alt = img.alt; }
  }

  document.querySelector('.lightbox-close').addEventListener('click', closeLB);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLB(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') navLB(-1);
    if (e.key === 'ArrowRight') navLB(1);
  });
  prevBtn.addEventListener('click', () => navLB(-1));
  nextBtn.addEventListener('click', () => navLB(1));

  // Scroll reveal
  const revealItems = document.querySelectorAll('.work-card');
  const rObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; rObs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  revealItems.forEach((el, i) => { el.style.opacity = '0'; el.style.transform = 'translateY(40px)'; el.style.transition = 'all 0.7s cubic-bezier(0.16,1,0.3,1) ' + (i * 0.1) + 's'; rObs.observe(el); });

  // Counters
  const counters = document.querySelectorAll('.stat-number');
  const cObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target);
        const start = performance.now();
        function count(now) {
          const p = Math.min((now - start) / 2000, 1);
          const cur = Math.floor((1 - Math.pow(1 - p, 3)) * target);
          el.textContent = cur + (target <= 100 ? (target === 100 ? '%' : '+') : '+');
          if (p < 1) requestAnimationFrame(count);
        }
        requestAnimationFrame(count);
        cObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(n => cObs.observe(n));

  // About reveal
  const aboutCards = document.querySelectorAll('.about-card');
  const aObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0) scale(1)'; aObs.unobserve(e.target); } });
  }, { threshold: 0.2 });
  aboutCards.forEach((c, i) => { c.style.opacity = '0'; c.style.transform = 'translateY(30px) scale(0.95)'; c.style.transition = 'all 0.7s cubic-bezier(0.16,1,0.3,1) ' + (i * 0.12) + 's'; aObs.observe(c); });

  // Stat reveal
  const statCards = document.querySelectorAll('.stat-card');
  const sObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; sObs.unobserve(e.target); } });
  }, { threshold: 0.3 });
  statCards.forEach((c, i) => { c.style.opacity = '0'; c.style.transform = 'translateY(20px)'; c.style.transition = 'all 0.6s cubic-bezier(0.16,1,0.3,1) ' + (i * 0.1) + 's'; sObs.observe(c); });

  // Hero parallax
  const heroContent = document.querySelector('.hero-content');
  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', (e) => { if (innerWidth < 768) return; heroContent.style.transform = 'translate(' + ((e.clientX / innerWidth - 0.5) * 15) + 'px,' + ((e.clientY / innerHeight - 0.5) * 15) + 'px)'; });
  hero.addEventListener('mouseleave', () => { heroContent.style.transform = ''; });

  // Image error
  document.querySelectorAll('.work-img-wrap img').forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
      const wrap = this.parentElement;
      const div = document.createElement('div');
      div.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#4a4a6a;font-size:0.85rem;background:linear-gradient(135deg,#0d0d1a,#0a0a18)';
      div.innerHTML = '<span style="font-size:2rem;opacity:0.3;">&#9670;</span><span>No image yet</span>';
      wrap.appendChild(div);
    });
  });

});
