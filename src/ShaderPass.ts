import {
  Camera,
  Mesh,
  OrthographicCamera,
  PlaneBufferGeometry,
  RawShaderMaterial,
  Scene,
  WebGLMultisampleRenderTarget,
  WebGLRenderer,
  WebGLRenderTarget,
  RGBAFormat,
  FloatType,
  MirroredRepeatWrapping,
  LinearFilter,
  Texture,
  WebGLMultipleRenderTargets,
} from "three";

class ShaderPass {
  _fbo:
    | WebGLMultisampleRenderTarget
    | WebGLRenderTarget
    | WebGLMultipleRenderTargets;
  _fsScene: Scene = new Scene();
  _camera: OrthographicCamera = new OrthographicCamera(
    -0.5,
    0.5,
    0.5,
    -0.5,
    0.000001,
    100
  );
  _fsQuad: Mesh;

  constructor(
    private _shaderMaterial: RawShaderMaterial,
    width: number,
    height: number,
    multiple?: boolean,
    fboCount?: number
  ) {
    const fboOptions = {
      format: RGBAFormat,
      type: FloatType,
      stencilBuffer: false,
      wrapS: MirroredRepeatWrapping,
      minFilter: LinearFilter,
      magFilter: LinearFilter,
    };
    if (multiple) {
      this._fbo = new WebGLMultipleRenderTargets(width, height, fboCount || 1);
      for (const texture of this._fbo.texture) {
        Object.keys(fboOptions).forEach((key) => {
          (texture as any)[key] = (fboOptions as any)[key];
        });
      }
    } else {
      this._fbo = new WebGLRenderTarget(width, height, fboOptions);
    }
    this._fsQuad = new Mesh(
      new PlaneBufferGeometry(1, 1),
      this._shaderMaterial
    );
    this._fsScene.add(this._fsQuad);
  }

  render(renderer: WebGLRenderer, toTexture: boolean = false) {
    if (toTexture) {
      renderer.setRenderTarget(this._fbo);
    } else {
      renderer.setRenderTarget(null);
    }
    renderer.render(this._fsScene, this._camera);
  }

  renderScene(
    renderer: WebGLRenderer,
    scene: Scene,
    camera: Camera,
    toTexture: boolean = false
  ) {
    if (toTexture) {
      renderer.setRenderTarget(this._fbo);
    } else {
      renderer.setRenderTarget(null);
    }
    scene.overrideMaterial = this.material;
    renderer.render(scene, camera);
    scene.overrideMaterial = null;
    if (toTexture) {
      renderer.setRenderTarget(null);
    }
  }

  usesMultipleRenderTargets(fbo: any): fbo is WebGLMultipleRenderTargets {
    return fbo.texture.length !== undefined;
  }

  usesSingleRenderTarget(fbo: any): fbo is WebGLRenderTarget {
    return fbo !== undefined;
  }

  setSize(width: number, height: number) {
    this._fbo.setSize(width, height);
    this._fsQuad.scale.set(width, height, 1);
    this._camera.left = -width / 2;
    this._camera.right = +width / 2;
    this._camera.top = +height / 2;
    this._camera.bottom = -height / 2;
    this._camera.updateProjectionMatrix();
  }

  get texture(): Texture {
    if (this.usesMultipleRenderTargets(this._fbo)) {
      return this._fbo.texture[0];
    } else {
      return this._fbo.texture;
    }
  }

  getTextureAttachment(idx: number): Texture {
    if (this.usesMultipleRenderTargets(this._fbo)) {
      return this._fbo.texture[idx];
    } else {
      return this._fbo.texture;
    }
  }

  get material() {
    return this._shaderMaterial;
  }

  updateUniform(key: string, value: any) {
    const uniform = this._shaderMaterial.uniforms[key];
    if (uniform) uniform.value = value;
  }
}

export { ShaderPass };
