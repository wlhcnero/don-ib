gsap.registerPlugin(ScrollTrigger);




// === THREE.JS ===

// 1. La scène (le plateau de tournage)
let scene = new THREE.Scene();

// 2. La caméra (notre point de vue)
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;

// 3. Le renderer (le moteur qui dessine)
let canvas = document.getElementById('planet-canvas');
let renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// 4. Créer une sphère (notre future planète)
let geometry = new THREE.SphereGeometry(1.5, 64, 64);
let texture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/1280px-Blue_Marble_2002.png');
let material = new THREE.MeshStandardMaterial({ map: texture });
let planet = new THREE.Mesh(geometry, material);
scene.add(planet);
planet.position.y = 0.2;
planet.position.x = -0.15;
planet.rotation.x = 0.3;


let light = new THREE.DirectionalLight(0xffffff, 1);
let ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);
light.position.set(5, 3, 5);
scene.add(light);
// 6. Étoiles en particules
let starsGeometry = new THREE.BufferGeometry();
let starsCount = 500;
let positions = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 100;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
let starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
let stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// 5. Boucle d'animation (dessine 60 fois par seconde)
function animate() {
    requestAnimationFrame(animate);
    planet.rotation.y += 0.005;
    stars.rotation.y += 0.0002;
    renderer.render(scene, camera);
}
animate();




// Animation espace (au chargement)

gsap.from('#espace h1', {
    opacity: 0,
    y: 50,
    duration: 2
});

// Animation approche (au scroll)
gsap.from('#approche h1', {
    opacity: 0,
    y: 50,
    duration: 2,
    scrollTrigger: {
        trigger: '#approche',
        start: 'top center'
    }
});

gsap.from('#planetes h1', {
    opacity: 0,
    y: 50,
    duration: 2,
    scrollTrigger: {
        trigger: '#planetes',
        start: 'top center'
    }
});

gsap.from('#futur h1', {
    opacity: 0,
    y: 50,
    duration: 2,
    scrollTrigger: {
        trigger: '#futur',
        start: 'top center'
    }
});

gsap.from('#espace p', {
    opacity: 0,
    y: 50,
    duration: 2,
    delay: 0.5
});

gsap.from('#approche p', {
    opacity: 0,
    y: 50,
    duration: 2,
    delay: 0.5,
    scrollTrigger: {
        trigger: '#approche',
        start: 'top center'
    }
});

gsap.from('#planetes p', {
    opacity: 0,
    y: 50,
    duration: 2,
    delay: 0.5,
    scrollTrigger: {
        trigger: '#planetes',
        start: 'top center'
    }
});

gsap.from('#futur p', {
    opacity: 0,
    y: 50,
    duration: 2,
    delay: 0.5,
    scrollTrigger: {
        trigger: '#futur',
        start: 'top center'
    }
});


gsap.to(camera.position, {
    z: 3,
    scrollTrigger: {
        trigger: '#approche',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    }
});

gsap.to(stars.rotation, {
    x: 0.5,
    y: 0.5,
    scrollTrigger: {
        trigger: '#approche',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    }
});
