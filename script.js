const vertexShader = `
    void main() {
        gl_Position = vec4( position, 1.0 );
    }
`;

const fragmentShaderSource = (colorType) => `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    
    float random (vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
    }

    void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        vec2 fMosaicScal = vec2(4.0, 2.0);
        vec2 vScreenSize = vec2(256,256);
        uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
        uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);       
        
        float t = time*0.06+random(uv.x)*0.4;
        float lineWidth = 0.001;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
            for(int i=0; i < 5; i++){
                color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*1.0 - length(uv));        
            }
        }
        
        ${colorType === 'purple' 
            ? 'gl_FragColor = vec4(color[2], color[0]*0.3, color[2]*1.5, 1.0);' 
            : 'gl_FragColor = vec4(color[0]*0.2, color[1], color[0]*0.5, 1.0);'
        }
    }
`;

function initShader(containerId, colorTheme) {
    const container = document.getElementById(containerId);
    const camera = new THREE.Camera();
    camera.position.z = 1;
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneBufferGeometry(2, 2);

    const uniforms = {
        time: { type: "f", value: 1.0 },
        resolution: { type: "v2", value: new THREE.Vector2() }
    };

    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShaderSource(colorTheme)
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    container.appendChild(renderer.domElement);

    function resize() {
        const rect = container.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        uniforms.resolution.value.x = renderer.domElement.width;
        uniforms.resolution.value.y = renderer.domElement.height;
    }

    window.addEventListener('resize', resize);
    resize();

    function animate() {
        requestAnimationFrame(animate);
        uniforms.time.value += 0.05;
        renderer.render(scene, camera);
    }
    animate();
}

// Inicializar ambos fondos
initShader('shader-charlotte', 'purple');
initShader('shader-protectora', 'green');