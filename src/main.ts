import {
  BoxBufferGeometry,
  LinearMipmapLinearFilter,
  Mesh,
  MeshNormalMaterial,
  WebGLCubeRenderTarget,
  PerspectiveCamera,
  Scene,
  CubeCamera,
  WebGLRenderer,
  RawShaderMaterial,
  GLSL3,
  DoubleSide,
  MeshStandardMaterial,
  TextureLoader,
  MeshBasicMaterial,
  SphereBufferGeometry,
  MeshPhongMaterial,
  MeshDepthMaterial,
  MeshLambertMaterial,
  AmbientLight,
  CubeTextureLoader,
} from "three";
import vertexShader from "./glsl/vert.glsl";
import fragmentShader from "./glsl/frag.glsl";
import cubeFragmentShader from "./glsl/cube.frag.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ShaderPass } from "./ShaderPass";
import "./main.sass";

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderer = new WebGLRenderer({
  antialias: true,
  canvas,
});

const fov = 120;
const aspect = canvas.width / canvas.height;
const near = 0.1;
const far = 100;
const camera = new PerspectiveCamera(fov, aspect, near, far);
camera.position.set(1, 1, 1);

const controls = new OrbitControls(camera, renderer.domElement);

const scene = new Scene();

const mesh = new Mesh(
  new BoxBufferGeometry(10, 10, 10),
  new RawShaderMaterial({
    side: DoubleSide,
    uniforms: {
      uCubeTexture: {
        value: new CubeTextureLoader()
          .setPath("/")
          .load([
            "posx.jpg",
            "negx.jpg",
            "posy.jpg",
            "negy.jpg",
            "posz.jpg",
            "negz.jpg",
          ]),
      },
    },
    vertexShader,
    fragmentShader: cubeFragmentShader,
    glslVersion: GLSL3,
  })
);
scene.add(mesh);

function resize(camera: PerspectiveCamera, renderer: WebGLRenderer) {
  const { innerWidth: width, innerHeight: height } = window;
  const aspect = width / height;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
}

const cubeRenderTarget = new WebGLCubeRenderTarget(1920, {
  generateMipmaps: true,
  minFilter: LinearMipmapLinearFilter,
});

const cubeCamera = new CubeCamera(1, 100000, cubeRenderTarget);
cubeCamera.position.y = 2;
scene.add(cubeCamera);

const shaderMaterial = new RawShaderMaterial({
  uniforms: {
    uCubeTexture: { value: cubeRenderTarget.texture },
    uCameraPos: { value: camera.position },
  },
  vertexShader,
  fragmentShader,
  glslVersion: GLSL3,
});
const shaderPass = new ShaderPass(shaderMaterial, 1024, 1024);

const reflector = new Mesh(
  new SphereBufferGeometry(1, 32, 32),
  new MeshLambertMaterial({
    map: new TextureLoader().load("/uvtest.jpg"),
    // color: 0xff0000,
  })
);
scene.add(reflector);

scene.add(new AmbientLight(0xffffff));

function render() {
  cubeCamera.update(renderer, scene);
  cubeCamera.matrix = camera.matrix;
  cubeCamera.matrixAutoUpdate = false;

  renderer.render(scene, camera);

  shaderMaterial.uniforms.uCameraPos.value = camera.position;
  shaderPass.render(renderer, false);

  controls.update();
}

resize(camera, renderer);
renderer.setAnimationLoop(render);

window.addEventListener("resize", () => resize(camera, renderer));
