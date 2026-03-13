const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
    }
`;

const fragmentShader = `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform int themeType; // 0 = Púrpura, 1 = Verde

    varying vec2 vUv;

    // Función de ruido simple para aleatoriedad
    float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        // Normalizar UV: -1.0 a 1.0, manteniendo relación de aspecto
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        
        // --- EFECTO 1: LÍNEAS VERTICALES DE FONDO (COMO LA IMAGEN) ---
        float lineDensity = 40.0;
        float linePattern = abs(sin(uv.x * lineDensity * 3.14159));
        // Degradado sutil de negro a gris oscuro
        vec3 col = vec3(0.02, 0.02, 0.03) * linePattern;

        // --- EFECTO 2: ONDA DE LUZ PULSANTE (COMO LA IMAGEN) ---
        float waveSpeed = 0.6;
        float waveFrequency = 6.0;
        float waveIntensity = 0.5;
        // Distancia circular desde el centro
        float dist = length(uv);
        // Onda sinusoidal pulsante
        float wave = sin(waveFrequency * dist - (time * waveSpeed)) * waveIntensity;
        // Grosor de la línea pulsante
        float linePulse = 0.005 / abs(dist + wave);

        // --- EFECTO 3: ALTERACIÓN DEL PATRÓN DE PÍXELES (RUIDO MOSAICO) ---
        // Crear un mosaico de píxeles grandes
        float mosaicScale = 64.0;
        vec2 grid = floor(uv * mosaicScale);
        float noiseVal = noise(grid);
        
        // Usar el ruido para modular la intensidad de la onda
        // Esto crea el patrón de píxeles "roto" y alterado
        float finalPulse = linePulse * (0.8 + noiseVal * 0.4);

        // --- COLORES (IMITANDO LA IMAGEN DE REFERENCIA) ---
        vec3 colorCyan = vec3(0.3, 0.9, 1.0);  // Cyan vibrante
        vec3 colorOrange = vec3(1.0, 0.6, 0.2); // Naranja ámbar
        
        // Mezcla de colores (Cian en el centro, naranja en los bordes)
        vec3 mixedColor = mix(colorCyan, colorOrange, smoothstep(0.0, 1.2, dist));
        
        // Aplicar la luz final
        vec3 light = mixedColor * finalPulse;

        // --- AJUSTE DE TEMA (PÚRPURA / VERDE) ---
        if (themeType == 0) { // Charlotte (Púrpura)
            // Mantener cian/naranja, pero sutilmente más púrpura
            light = mix(light, vec3(0.7, 0.2, 1.0), 0.1); 
        } else { // Protectora (Verde)
            // Mezclar más verde esmeralda
            light = mix(light, vec3(0.1, 1.0, 0.5), 0.2);
        }

        // --- FINAL COLOR ASSEMBLY ---
        // Fondo oscuro + Luz pulsante pixelada
        col += light;

        gl_FragColor = vec4(col, 1.0);
    }
`;

function createShader(containerId, theme) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    camera.position.z = 1;

    // Usar PlaneGeometry para texturizado UV
    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        themeType: { value: theme } // Paso del tipo de tema
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true // Permite ver el fondo oscuro
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Renderer con Alpha para transparencia
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    container.appendChild(renderer.domElement);

    function resize() {
        const w = container.offsetWidth;
        const h = container.offsetHeight;
        renderer.setSize(w, h);
        uniforms.resolution.value.x = w;
        uniforms.resolution.value.y = h;
    }

    window.addEventListener('resize', resize);
    resize();

    function animate(now) {
        requestAnimationFrame(animate);
        uniforms.time.value = now * 0.001; // Tiempo en segundos
        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
}

// Inicializar: 0 para Púrpura (Charlotte), 1 para Verde (Protectora)
window.addEventListener('DOMContentLoaded', () => {
    createShader('shader-charlotte', 0);
    createShader('shader-protectora', 1);
});