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
    uniform vec3 themeColor; // Paso de color único para cada sección

    varying vec2 vUv;

    // Función de ruido simple
    float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
        // Normalizar UV: -1.0 a 1.0, manteniendo relación de aspecto
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        
        // --- EFECTO 1: LÍNEAS VERTICALES DE FONDO ---
        float lineDensity = 50.0;
        float linePattern = abs(sin(uv.x * lineDensity * 3.14159));
        // Degradado sutil de negro a gris oscuro
        vec3 col = vec3(0.01, 0.01, 0.015) * linePattern;

        // --- EFECTO 2: ONDA DE LUZ PULSANTE ---
        float waveSpeed = 0.5;
        float waveFrequency = 5.0;
        float waveIntensity = 0.4;
        float dist = length(uv);
        float wave = sin(waveFrequency * dist - (time * waveSpeed)) * waveIntensity;
        // Grosor de la línea pulsante (más visible)
        float linePulse = 0.007 / abs(dist + wave);

        // --- EFECTO 3: PATRÓN DE PÍXELES ALTERADO (NUEVO) ---
        // Crear un mosaico de píxeles más grandes y nítidos
        float mosaicScale = 80.0;
        vec2 grid = floor(uv * mosaicScale);
        float noiseVal = noise(grid);
        
        // Usar el ruido para modular la intensidad de la onda
        float finalPulse = linePulse * (0.7 + noiseVal * 0.6);

        // --- COLORES (IMITANDO LA IMAGEN DE REFERENCIA CON VARIACIONES) ---
        vec3 colorCyan = vec3(0.3, 0.9, 1.0);  // Cyan vibrante
        vec3 colorOrange = vec3(1.0, 0.6, 0.2); // Naranja ámbar
        
        // Mezcla de colores base
        vec3 mixedColor = mix(colorCyan, colorOrange, smoothstep(-0.2, 1.3, dist));
        
        // Aplicar la luz pulsante pixelada
        vec3 light = mixedColor * finalPulse;

        // --- APLICACIÓN DEL COLOR DEL TEMA ---
        // Mezclar sutilmente el color base con el color único del tema (Púrpura, Verde, Azul)
        light = mix(light, themeColor, 0.15); 

        // --- FINAL COLOR ASSEMBLY ---
        col += light;

        gl_FragColor = vec4(col, 1.0);
    }
`;

function createShader(containerId, colorHex) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    camera.position.z = 1;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const uniforms = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
        themeColor: { value: new THREE.Color(colorHex) } // Paso del color único
    };

    const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true // Permite ver el fondo oscuro
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

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

// Inicializar con colores de tema únicos
window.addEventListener('DOMContentLoaded', () => {
    createShader('shader-charlotte', '#8A2BE2'); // Púrpura
    createShader('shader-protectora', '#00FF7F'); // Verde esmeralda
    createShader('shader-football', '#1E90FF');   // Azul dodger
});