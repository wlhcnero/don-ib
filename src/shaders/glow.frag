varying vec2 vUv;

uniform vec3 uColor;
uniform float uIntensity;
uniform float uTime;

void main() {
  // Distance from center of the sprite
  float dist = length(vUv - 0.5) * 2.0;

  // Soft radial glow
  float glow = 1.0 - smoothstep(0.0, 1.0, dist);
  glow = pow(glow, 2.5);

  // Subtle pulsation
  float pulse = 1.0 + sin(uTime * 0.8) * 0.08;
  glow *= pulse;

  float alpha = glow * uIntensity;

  gl_FragColor = vec4(uColor * glow * uIntensity, alpha);
}
