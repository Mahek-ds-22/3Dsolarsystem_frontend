// Main Three.js variables
let scene, camera, renderer, controls;
let planets = [];
let animationId = null;
let isPaused = false;
let clock = new THREE.Clock();

// Planet data
const planetData = [
    { name: "Sun", radius: 10, color: 0xffff00, distance: 0, speed: 0, rotationSpeed: 0.01 },
    { name: "Mercury", radius: 0.8, color: 0xa9a9a9, distance: 20, speed: 0.04, rotationSpeed: 0.004 },
    { name: "Venus", radius: 1.5, color: 0xffa500, distance: 30, speed: 0.015, rotationSpeed: 0.002 },
    { name: "Earth", radius: 1.6, color: 0x1E90FF, distance: 40, speed: 0.01, rotationSpeed: 0.02 },
    { name: "Mars", radius: 1.2, color: 0xff4500, distance: 50, speed: 0.008, rotationSpeed: 0.018 },
    { name: "Jupiter", radius: 3.5, color: 0xffd700, distance: 70, speed: 0.002, rotationSpeed: 0.04 },
    { name: "Saturn", radius: 3, color: 0xf4a460, distance: 90, speed: 0.0009, rotationSpeed: 0.038, hasRing: true },
    { name: "Uranus", radius: 2.5, color: 0x00bfff, distance: 110, speed: 0.0004, rotationSpeed: 0.03 },
    { name: "Neptune", radius: 2.4, color: 0x0000ff, distance: 130, speed: 0.0001, rotationSpeed: 0.032 }
];

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 50, 150);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Add stars background
    addStars();
    
    // Create solar system
    createSolarSystem();
    
    // Create controls UI
    createControlsUI();
    
    // Add event listeners
    setupEventListeners();
    
    // Start animation
    animate();
}

// Create the solar system
function createSolarSystem() {
    planetData.forEach((planet, index) => {
        // Create planet geometry
        const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
        
        // Create planet material
        let material;
        if (planet.name === "Sun") {
            material = new THREE.MeshBasicMaterial({ 
                color: planet.color,
                emissive: planet.color,
                emissiveIntensity: 1
            });
        } else {
            material = new THREE.MeshPhongMaterial({ 
                color: planet.color,
                shininess: 10
            });
        }
        
        // Create planet mesh
        const planetMesh = new THREE.Mesh(geometry, material);
        
        // Create orbit path
        const orbitGeometry = new THREE.BufferGeometry();
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.5 });
        
        const points = [];
        const segments = 64;
        for (let i = 0; i <= segments; i++) {
            const theta = (i / segments) * Math.PI * 2;
            points.push(new THREE.Vector3(
                planet.distance * Math.cos(theta),
                0,
                planet.distance * Math.sin(theta)
            ));
        }
        orbitGeometry.setFromPoints(points);
        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
        
        // Add to scene
        scene.add(orbit);
        
        if (planet.distance > 0) {
            planetMesh.position.x = planet.distance;
        }
        
        scene.add(planetMesh);
        
        // Create Saturn's ring if applicable
        if (planet.hasRing) {
            const ringGeometry = new THREE.RingGeometry(planet.radius * 1.4, planet.radius * 2.2, 32);
            const ringMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xf4e5c2,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.8
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.rotation.x = Math.PI / 2;
            planetMesh.add(ring);
        }
        
        // Store planet data for animation
        planets.push({
            mesh: planetMesh,
            orbitRadius: planet.distance,
            speed: planet.speed,
            rotationSpeed: planet.rotationSpeed,
            angle: Math.random() * Math.PI * 2,
            name: planet.name
        });
    });
}

// Add stars to the background
function addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true
    });
    
    const starsVertices = [];
    for (let i = 0; i < 1000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starsVertices.push(x, y, z);
    }
    
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
}

// Create controls UI
function createControlsUI() {
    const controlsContainer = document.getElementById('planet-controls');
    
    planets.forEach((planet, index) => {
        if (planet.name === "Sun") return;
        
        const controlDiv = document.createElement('div');
        controlDiv.className = 'planet-control';
        
        const label = document.createElement('label');
        label.textContent = planet.name;
        label.htmlFor = `speed-${index}`;
        
        const input = document.createElement('input');
        input.type = 'range';
        input.id = `speed-${index}`;
        input.min = '0';
        input.max = '0.1';
        input.step = '0.001';
        input.value = planet.speed;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = `Speed: ${planet.speed.toFixed(4)}`;
        
        input.addEventListener('input', () => {
            planet.speed = parseFloat(input.value);
            valueDisplay.textContent = `Speed: ${planet.speed.toFixed(4)}`;
        });
        
        controlDiv.appendChild(label);
        controlDiv.appendChild(input);
        controlDiv.appendChild(valueDisplay);
        controlsContainer.appendChild(controlDiv);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Pause/Resume button
    document.getElementById('pause-resume').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pause-resume').textContent = isPaused ? 'Resume' : 'Pause';
    });
    
    // Reset view button
    document.getElementById('reset-view').addEventListener('click', () => {
        camera.position.set(0, 50, 150);
        controls.reset();
    });
    
    // Dark/light mode toggle
    document.getElementById('toggle-theme').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });
    
    // Window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Tooltip for planets
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);
    
    // Mouse move event for tooltip
    renderer.domElement.addEventListener('mousemove', (event) => {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(scene.children);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            const planet = planets.find(p => p.mesh === object || object.parent === p.mesh);
            
            if (planet) {
                tooltip.textContent = planet.name;
                tooltip.style.left = `${event.clientX + 10}px`;
                tooltip.style.top = `${event.clientY + 10}px`;
                tooltip.style.opacity = '1';
                return;
            }
        }
        
        tooltip.style.opacity = '0';
    });
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    
    if (!isPaused) {
        // Update planet positions
        planets.forEach(planet => {
            if (planet.orbitRadius > 0) {
                planet.angle += planet.speed * delta * 10;
                planet.mesh.position.x = planet.orbitRadius * Math.cos(planet.angle);
                planet.mesh.position.z = planet.orbitRadius * Math.sin(planet.angle);
            }
            
            // Rotate planet
            planet.mesh.rotation.y += planet.rotationSpeed * delta * 10;
        });
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// Start the application
init();
