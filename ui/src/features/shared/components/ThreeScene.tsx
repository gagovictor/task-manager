import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import seedrandom from 'seedrandom';
import { useTheme } from '@mui/material/styles';

interface ThreeSceneProps {
    seed?: string;
    nodesCount?: number;
    waveSegments?: number;
    initialFov?: number;
    targetFov?: number;
    lookIntensity?: number;
    radius?: number;
    particleCount?: number;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({
    seed = 'gago.works',
    nodesCount = 20,
    waveSegments = 50,
    initialFov = 75,
    targetFov = 125,
    lookIntensity = 1,
    radius = 15,
    particleCount = 15000,
}) => {
    const sceneRef = useRef<HTMLDivElement | null>(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const camera = useRef<THREE.PerspectiveCamera>();
    const particles = useRef<THREE.Points>();
    const nodes = useRef<THREE.Mesh[]>([]);
    const lines = useRef<THREE.Line[]>([]);
    const lineGeometries = useRef<THREE.BufferGeometry[]>([]);
    const originalPositions = useRef<Float32Array[]>([]);
    
    const theme = useTheme();
    
    useEffect(() => {
        const textureLoader = new THREE.TextureLoader();
        let scrollPosition = 0;
        
        seedrandom(seed, { global: true });
        
        const scene = new THREE.Scene();
        camera.current = new THREE.PerspectiveCamera(initialFov, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        sceneRef.current?.appendChild(renderer.domElement);
        
        // Set theme-aware background color
        scene.background = new THREE.Color(theme.palette.background.default);
        
        // Create nodes representing neurons
        const nodeGeometry = new THREE.SphereGeometry(0.025, 32, 32);
        const nodeMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(theme.palette.primary.main),
            emissive: new THREE.Color(theme.palette.primary.main),
            metalness: 0,
            roughness: 0.1,
            side: THREE.DoubleSide,
        });
        
        for (let i = 0; i < nodesCount; i++) {
            const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
            node.position.x = Math.random() * 50 - 25;
            node.position.y = Math.random() * 50 - 25;
            node.position.z = Math.random() * 50 - 25;
            node.scale.x *= 3;
            node.scale.y *= 3;
            node.scale.z *= 3;
            nodes.current.push(node);
            scene.add(node);
        }
        
        // Create oscillating lines connecting nodes
        const pulseMaterial = new THREE.LineBasicMaterial({
            transparent: true,
            linewidth: 2,
            vertexColors: true,
            depthWrite: false,
        });
        
        for (let i = 0; i < nodes.current.length; i += 2) {
            for (let j = i + 1; j < nodes.current.length; j += 2) {
                const points: THREE.Vector3[] = [];
                const colors: number[] = [];
                
                for (let k = 0; k <= waveSegments; k++) {
                    const t = k / waveSegments;
                    const x = THREE.MathUtils.lerp(nodes.current[i].position.x, nodes.current[j].position.x, t);
                    const y = THREE.MathUtils.lerp(nodes.current[i].position.y, nodes.current[j].position.y, t);
                    const z = THREE.MathUtils.lerp(nodes.current[i].position.z, nodes.current[j].position.z, t);
                    points.push(new THREE.Vector3(x, y, z));

                    // Add initial color (using primary color)
                    const primaryColor = new THREE.Color(theme.palette.primary.main);
                    colors.push(primaryColor.r, primaryColor.g, primaryColor.b);
                }
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(colors), 3));
                
                // Store the original positions for animation
                originalPositions.current.push(new Float32Array(geometry.attributes.position.array));
                
                const line = new THREE.Line(geometry, pulseMaterial);
                lines.current.push(line);
                lineGeometries.current.push(geometry);
                scene.add(line);
            }
        }
        
        // Particle field
        const particleGeometry = new THREE.BufferGeometry();
        const particleTexture = textureLoader.load('/images/particle.png');
        const particleMaterial = new THREE.PointsMaterial({
            map: particleTexture,
            transparent: true,
            size: 0.005,
        });
        const particlesData: number[] = [];
        
        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            particlesData.push(x, y, z);
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(particlesData), 3));
        particles.current = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles.current);
        
        // Set up camera position
        camera.current.position.set(0, 0, 5);
        scene.fog = new THREE.Fog(theme.palette.background.default, 0, 50);
        
        // Animation function
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update camera position based on mouse movement
            const mouseXCentered = mouseX.current - 0.5;
            const mouseYCentered = mouseY.current - 0.5;
            camera.current.position.x += mouseXCentered * lookIntensity;
            camera.current.position.y += -mouseYCentered * lookIntensity;
            camera.current.position.lerp(new THREE.Vector3(0, 0, 5), 0.1);
            
            // Rotate scene based on scroll direction
            const deltaScroll = scrollPosition - window.scrollY;
            scene.rotation.x += deltaScroll * 0.001;
            scrollPosition = window.scrollY;
            
            // Adjust camera field of view based on scroll
            const fov = THREE.MathUtils.lerp(initialFov, targetFov, Math.min(window.scrollY / window.innerHeight, 1));
            camera.current.fov = fov;
            camera.current.updateProjectionMatrix();
            
            camera.current.lookAt(scene.position);
            particles.current.position.x += Math.sin(Date.now() * 0.0001) * 0.001;
            particles.current.position.y += Math.cos(Date.now() * 0.0001) * 0.001;
            
            // Update line oscillations, colors, and opacity
            lines.current.forEach((line, index) => {
                const geometry = lineGeometries.current[index];
                const positions = geometry.attributes.position.array as Float32Array;
                const original = originalPositions.current[index]; // Get the original positions
                const colors = geometry.attributes.color.array as Float32Array;

                const primaryColor = new THREE.Color(theme.palette.primary.main);
                const secondaryColor = new THREE.Color(theme.palette.secondary.main);

                // Unique phase for each line to desynchronize animations
                const phaseOffset = index * 0.5;

                for (let k = 0; k <= waveSegments; k++) {
                    const t = k / waveSegments;
                    const amplitude = 0.5;
                    const frequency = 2; // Lower frequency to make the oscillation slower
                    const speed = 0.0002; // Slower speed
                    const offsetY = amplitude * Math.sin(frequency * t * Math.PI * 2 + Date.now() * speed + phaseOffset);
                    const i = k * 3; // x, y, z components

                    // Set the y component relative to the original position
                    positions[i] = original[i];       // x
                    positions[i + 1] = original[i + 1] + offsetY; // y with oscillation
                    positions[i + 2] = original[i + 2]; // z

                    // Update color to oscillate between primary and secondary
                    const colorFactor = 0.5 + 0.5 * Math.sin(Date.now() * 0.001 + t * Math.PI + phaseOffset);
                    const interpolatedColor = primaryColor.clone().lerp(secondaryColor, colorFactor);

                    colors[i] = interpolatedColor.r;
                    colors[i + 1] = interpolatedColor.g;
                    colors[i + 2] = interpolatedColor.b;
                }

                geometry.attributes.position.needsUpdate = true;
                geometry.attributes.color.needsUpdate = true;

                // Update line opacity to oscillate with time, with different values for each line
                const opacityFactor = 0.2 + 0.2 * Math.sin(Date.now() * 0.002 + phaseOffset); // Slower opacity change
                line.material.opacity = opacityFactor;
            });

            // Update renderer
            renderer.render(scene, camera.current);
        };
        
        animate();
        
        // Handle window resize
        const handleResize = () => {
            const newWidth = window.innerWidth;
            const newHeight = window.innerHeight;
            camera.current.aspect = newWidth / newHeight;
            camera.current.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        };
        
        // Handle mouse move
        const handleMouseMove = (event: MouseEvent) => {
            mouseX.current = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY.current = (event.clientY / window.innerHeight) * 2 - 1;
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [seed, nodesCount, waveSegments, initialFov, targetFov, lookIntensity, radius, particleCount, theme]);
    
    return (
        <div
        ref={sceneRef}
        style={{
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            zIndex: -1,
            position: 'fixed',
        }}
        />
    );
};

export default ThreeScene;
