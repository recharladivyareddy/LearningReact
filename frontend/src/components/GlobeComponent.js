// Globe.js
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sphere, Text } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const Globe = () => {
  const globeRef = useRef();

  // Rotate the globe
  useFrame(() => {
    globeRef.current.rotation.y += 0.01;
  });

  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Sphere ref={globeRef} args={[1, 64, 64]}>
        <meshStandardMaterial color="royalblue" />
      </Sphere>
      {/* Add technology labels here */}
      <Text position={[1.5, 1, 1]} color="white">Java</Text>
      <Text position={[-1.5, -1, -1]} color="white">Python</Text>
      {/* Add more labels as needed */}
    </Canvas>
  );
}

export default Globe;
