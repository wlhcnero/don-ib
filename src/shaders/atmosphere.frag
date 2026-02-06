varying vec3 vNormal;
varying vec3 vWorldPosition;

uniform vec3 uColor;
uniform float uIntensity;
uniform vec3 uCameraPosition;

void main() {
  // View direction
  vec3 viewDir = normalize(uCameraPosition - vWorldPosition);

  // Fresnel-based atmosphere glow
  float fresnel = 1.0 - dot(vNormal, viewDir);
  fresnel = pow(fresnel, 3.0);

  // Soft falloff
  float alpha = fresnel * uIntensity;
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(uColor, alpha);
}
