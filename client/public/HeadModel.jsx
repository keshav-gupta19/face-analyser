/* eslint-disable react/no-unknown-property */
/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.16 headModel.gltf 
Author: Rodesqa (https://sketchfab.com/rodesqa)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/free-cute-girl-face-b0e78951b64848389dc939f10ec5d531
Title: free Cute girl face
*/

import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export default function Model(props) {
  const { nodes, materials } = useGLTF('/headModel.gltf')
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={nodes.Object_2.geometry} material={materials.defaultMat} />
        <mesh geometry={nodes.Object_3.geometry} material={materials.defaultMat} />
        <mesh geometry={nodes.Object_4.geometry} material={materials.defaultMat} />
        <mesh geometry={nodes.Object_5.geometry} material={materials.defaultMat} />
        <mesh geometry={nodes.Object_6.geometry} material={materials.defaultMat} />
        <mesh geometry={nodes.Object_7.geometry} material={materials.defaultMat} />
        <mesh geometry={nodes.Object_8.geometry} material={materials.defaultMat} />
      </group>
    </group>
  )
}

useGLTF.preload('/headModel.gltf')
