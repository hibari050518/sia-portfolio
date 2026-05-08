import { useEffect, useRef } from 'react'

/* ── CSS scoped under .oa-wrap ── */
const ANIM_CSS = `
@property --ink-bloom{syntax:"<number>";inherits:false;initial-value:0}

.oa-wrap { --ink: #f5f0ea; opacity: 0.68; }
.oa-stage { position:relative; width:100%; aspect-ratio:870.82/419.42; }
.oa-logo  { width:100%; height:100%; display:block; overflow:visible; }

.oa-wrap .brush {
  fill:none; stroke:var(--ink); stroke-linecap:round; stroke-linejoin:round;
  stroke-dasharray:var(--len,9999); stroke-dashoffset:var(--len,9999);
  animation:oaDraw var(--dur,1s) cubic-bezier(.55,.05,.25,1) var(--delay,0s) forwards;
}
@keyframes oaDraw { to { stroke-dashoffset:0 } }

.oa-wrap #ornaments {
  opacity:0;
  -webkit-mask:radial-gradient(circle at 50% 50%,
    #000 calc(var(--ink-bloom)*70%),
    rgba(0,0,0,.55) calc(var(--ink-bloom)*90%),
    transparent calc(var(--ink-bloom)*110%));
  mask:radial-gradient(circle at 50% 50%,
    #000 calc(var(--ink-bloom)*70%),
    rgba(0,0,0,.55) calc(var(--ink-bloom)*90%),
    transparent calc(var(--ink-bloom)*110%));
  filter:blur(calc((1 - var(--ink-bloom))*1.4px));
  animation:oaInkBloom 2.8s cubic-bezier(.45,.05,.25,1) .30s forwards,
            oaOrnFadeIn 1.2s ease-out .30s forwards;
}
@keyframes oaInkBloom { from{--ink-bloom:0} to{--ink-bloom:1} }
@keyframes oaOrnFadeIn { from{opacity:0} 20%{opacity:.85} to{opacity:1} }

.oa-wrap .comet {
  fill:none; stroke:var(--ink); stroke-linecap:round;
  filter:url(#oa-meteor-glow); opacity:.92;
  stroke-dasharray:var(--len,9999); stroke-dashoffset:var(--len,9999);
  animation:oaDraw var(--dur,1s) cubic-bezier(.55,.05,.25,1) var(--delay,0s) forwards;
}
.oa-wrap .b-tatt { display:none; }

.oa-wrap .orn {
  fill:none; stroke:var(--ink); stroke-linecap:round; stroke-linejoin:round;
  stroke-width:.35; opacity:0;
  animation:oaLinkFlow var(--tdur,6s) ease-in-out var(--delay,0s) infinite both;
}
.oa-wrap .orn.sparkle {
  fill:none; stroke-linecap:round; filter:url(#oa-star-glow);
  transform-box:fill-box; transform-origin:center;
  stroke-dasharray:var(--len,80); stroke-dashoffset:var(--len,80);
  animation:oaRayDraw 1.1s cubic-bezier(.4,.05,.25,1) var(--rdelay,0s) forwards,
            oaStarFlow var(--tdur,5s) ease-in-out var(--delay,0s) infinite both;
}
@keyframes oaRayDraw { to { stroke-dashoffset:0 } }

.oa-wrap .orn.star {
  stroke:none; fill:var(--ink);
  transform-box:fill-box; transform-origin:center;
  filter:url(#oa-star-glow);
  animation:oaStarFlow var(--tdur,4.4s) ease-in-out var(--delay,0s) infinite both;
}
@keyframes oaLinkFlow { 0%,100%{opacity:0} 50%{opacity:var(--maxOp,.18)} }
@keyframes oaStarFlow {
  0%  {opacity:0;transform:scale(.6)}
  18% {opacity:var(--maxOp,.6);transform:scale(1.05)}
  28% {opacity:calc(var(--maxOp,.6)*.35);transform:scale(.85)}
  38% {opacity:var(--maxOp,.6);transform:scale(1.1)}
  60% {opacity:calc(var(--maxOp,.6)*.55);transform:scale(.95)}
  72% {opacity:var(--maxOp,.6);transform:scale(1.08)}
  100%{opacity:0;transform:scale(.6)}
}
.oa-wrap .nib { display:none; }
`

const SVG_INNER = `
<defs>
  <filter id="oa-silk-glow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="0.4" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="oa-star-glow" x="-200%" y="-200%" width="500%" height="500%">
    <feGaussianBlur stdDeviation="1.2" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <filter id="oa-meteor-glow" x="-400%" y="-400%" width="900%" height="900%">
    <feGaussianBlur stdDeviation="2.4" result="b1"/>
    <feGaussianBlur stdDeviation="0.8" result="b2"/>
    <feMerge><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <clipPath id="oa-cp-S"><path d="M381.37,157.32c-1.15.16-.89.06-1.22-.64-.75-1.56-.95-3.72-1.79-5.43-6.98-14.28-31.35-12.61-29.28,4.81,2.01,16.93,42.18,17.14,35.42,40.33-3.37,11.56-24.13,18.72-35.24,13.65-7.27-3.32-15.36-13.34-10.87-20.86.28-.47,1.26-1.96,1.67-1.99,1.32-.1.29,1.33.17,1.66-1.49,4.11-2.16,4.24.2,8.61,4.28,7.94,15.09,11.78,24.26,10.96,12.99-1.16,15.72-13.89,8.48-22.5-9.34-11.09-35.95-13.81-31.02-32.75,3.7-14.19,26.76-15.83,38.43-9.52l.81,13.66Z"/></clipPath>
  <clipPath id="oa-cp-a"><path d="M507.65,201.9c3.78,3.23,13.69-1.94,17.74-3.33l.73.93c-8.77,2.62-21.85,16.42-27.15,2-4.68-.45-8.51,2.7-12.65,3.97-8.87,2.73-20.72,1.54-18.63-9.63,1.47-7.82,13.82-11.56,20.8-13.66,2.21-.67,9.88-1.66,10.27-3.66.71-3.61-.15-14.55-2.17-17.73-3.52-5.53-12.75-3.78-16.35,1.11-2.71,3.69-3.28,13.44-10.36,10.42-4.69-2-.07-7.24,2.35-9.22,8.16-6.69,31.8-14.61,33.65,1.25,1.1,9.45-.74,20.69-.03,30.38.11,1.55.75,6.28,1.8,7.18ZM498.75,182.3c-7.61,1.28-29.84,8.92-20.28,19,4.99,5.26,14.11-.88,19.78-2.51l.49-16.49Z"/></clipPath>
  <clipPath id="oa-cp-i1"><path d="M433.76,170.35c-.1,1.2-2.83.5-3.3.79-.62.38-.93,1.36-1.04,2.03-.84,5.04-.64,21.45-.03,26.78s3.96,3.28,8.22,4.04c1.07.51-.73,1.78-.83,1.78h-21.35c-2.61-2.92,3.3-1.77,4.91-2.04,2.44-.41,2.83-3.38,3.01-5.31.82-8.43-.28-18.25-.51-26.75l-3.86-1.33h14.78Z"/></clipPath>
  <clipPath id="oa-cp-i2"><path d="M432.97,157.5c-3.8,4.81-13.3,2.41-15.08-2.83,5.69.93,9.61-.68,13.13-4.81,1.05-1.23,1.24-2.99,2.73-3.79,2.1,3.91,2.06,7.84-.78,11.43Z"/></clipPath>
  <clipPath id="oa-cp-tatt"><path d="M365.2,271.78v25.98c0,1.86.47,7.7,2.19,8.82.78.5,1.85,1.46,5.07-.23,0,0,1.39-.41,6-3.74,5.34-3.85,7.32-5.45,10.97-7.54,7.83-4.47,21.86,2.31,22.21,2.45-3.52-11.55,3.78-23.2,15.97-27.95,15.42-6.01,28.89,3.93,32.1,14.02,1.83,5.75,1.64,12.55-.98,18.07-.45.95.26,2.31,1.78,2.24,2.76-.13,17.97,0,23.26-3.02,2.87-1.64,5.4-3.59,4.88-6.84-1.8-11.22,5.06-20.4,11.81-23.57,16.66-7.83,31.78.22,35.94,11.82,3.64,10.14-1.73,20.31-3.21,21.59-1.38,1.19,2.18,1.1,4.07,1.33,7.5.91,11.18,1.15,18.63-.74,5.38-1.37,10.73-4.57,16.26-5.56.34-.06.58-.32.58-.63l-.2-24.95c-.39-1.94-.54-2.79-2.6-3.14-1.33-.23-4.79.71-4.78-1.1h21.14c-.02,1.82-3.56,1.01-5.04,1.28-1.79.32-2.44,2.08-2.44,3.66l-.14,23.02c0,.32.32.56.67.5,6.89-1.08,13.35-1.3,20.32-.62,0,0,1.48.15,1.48.15.48.08,1.16.13.33.43-.33.12-1.19.49-2.16,1.06-1.72,1.01-4.22,3.1-4.87,4.85-.36.98-.53,1.94-.05,2.83,1.42,2.69,15.03,1.68,20.6.31.64-.16,1.08-.71,1.03-1.3-.17-2.37-.74-4.5-.89-6.93-.04-.65-.47-1.04.47-1.57l3.11,5.5c.54.75,1.79,2.5,2.71,2.73,1.6.41,7.69-2.09,10.54-2.42,1.79-.21,5.41-.65,7.2-.67.69-4.56-2.87-7.03-6.65-9.26-4.65-2.74-15.06-6.18-16.16-11.59-2.4-11.82,11.9-15.3,21.92-12.25,0,0,1.48.62,2.07,1.17,1.74,1.63,2.3,3.77,2.38,5.31.11,2.06-.06,1.68-.07,3.12l-.86.96c-.81-3.02-2.77-5.99-5.59-7.84-10.8-7.1-20.6,4.24-10.24,11.56,7.67,5.42,19.97,7.67,18.55,19.03-.07.59.31,1.15.94,1.3,10.13,2.48,19.02,5.84,29.11,2.72.67-.21,3.53-.82,3.25-1.41-.42-.88-.37-2.08-.35-3.45.16-8.67.21-16.45.21-25.05,0-.52-.01-2.5-.03-3.66,0-.45-.42-.86-.93-.9-1.39-.1-3.58-.15-7.01-.23-3.93-.08-9.25.07-10.95.07-.44,0-.7-.69.14-.95,3.14-.94,17.92,1.1,21.86-3.46,1.06-1.23,1.17-1.79,1.49-3.01.17-.64.19-2.17,1.31-2.01,0,0-.12,4.7-.13,6.27,0,.35.05,1.28.44,1.28,4.56.01,18.25-.17,18.25-.17l-.04,2c-.04,2.45-1.18,2.03-1.38,1.6-1.3-2.76-8.36-2.06-10.61-2.03-6.14.06-6.41.1-6.41.1l-.06.9-.07,25.75c0,.33.12,2.36.14,3.15.04,1.28.3,2.31.78,2.09,4.81-2.23,8.38-2.13,12.35-1.59,3.62.49,7.26,2.82,10.33,4.36.86.43,4.22,2.16,7.64,2.81,4.67.89,9.93.64,13.4.13,2.3-.34,6.57-1.76,10.65-2.55,2.91-.56,7.53-.88,10.05.86.22.15-.03.33-1.1-.17-1.79-.84-6.01-.21-6.68-.14-4.35.44-10.16,2.4-11.63,2.74-3.39.77-9.73,2.01-18.95-1.37-1.27-.46-5.76-2.8-6.61-2.14-.79.6-3.16,2.32-5.72,3.71-.77.42-7.47,4.11-14.15.84-.7-.34-4.51-2.58-5.35-4.28-.57-1.15-5.29,1.69-11.91,1.88-1.88.05-13.29-.69-22.15-2.88-.74-.18-1.53-.02-2.1.44-.67.54-1.36,1.29-1.94,1.66-6.1,3.96-13.08,4.18-16.9,2.66-1.71-.68-4.59-1.77-5.93-1.82-1.8-.07-2.06.13-3.99.41-2.29.34-1.01.25-7.49,1.01-1.22.14-4.82.12-7.23.09-1.83-.03-3.65-.33-5.3-1.02-.9-.37-1.64-.8-2.07-1.33-.91-1.11-.79-2.56-.39-3.64.31-.82.87-1.51,1.75-2.39s4.98-3.53,4.98-3.53c0,0-2.57-.35-4.89-.42-5.1-.17-5.25.35-11.55,1.21-1.3.18-2.44,1.27-2.51,2.45-.3,4.85.27,8.03,7.2,7.18v1.18h-21.14v-1.18c6.34.68,7.8-2.42,7.59-7.92-.27-.26-6.1,1.68-8.1,2.7-.94.48-2.97,1.19-2.97,1.19-3.93,1.47-9.8,3.3-15.68,3.49-2.42.08-9.88-.44-13.71-.44-2.06,0-5.08,1.05-9.36,2.47-5.63,1.87-19.36,2.07-27.33-3.79-.59-.44-4.47-3.87-5.45-4.84-1.14-1.14-9.75,1.93-11.39,2.29-8.52,1.84-14.79,1.77-18.88,2.27-1.4.17-3.6,1.17-4.5,1.59-1.66.78-2.91,1.52-3.9,2.08-1.83,1.04-.59.35-3.35,1.52-3.66,1.55-4.11,1.2-7.34,1.78-4.36.79-5.39.5-10.43-.5-5.05-1.01-10.31-4.59-11.79-5.76-1.73-1.37-5.45-5.19-6.38-5.86-3.48-2.51-14.36-7.6-20.8-3.72-6.96,4.2-8.17,5.88-8.94,6.39-.38.25-.32.71-4.52,3.51-2.76,1.84-2.21,1.48-2.64,1.76-3.56,2.31-7.94,2.24-11.34.8-1.38-.59-3.42-2.88-3.84-5.2-.42-2.3-.33-10.46-.33-10.46,0,0-3.05-.41-10.11,2.32q-5.9,2.28-25.01,11.57c-2.21,1.08-4.26,2.79-8.58,3.6-5.13.96-8.23-1.16-9.41-2.31-2.71-2.64-3.67-7.12-3.67-8.87l-.35-8.22c-.26.04-.71.52-.98.87-4.57,5.93-7.2,8-14.72,10.89-6.06,2.33-13.8,4.45-16.95,5.24-4.84,1.2-6.29,1.47-9.06,1.1-2.86-.38-3.88-3.87-3.66-5.89-6.24,2.56-15.71,9.17-22.43,4.53-1.94-1.34-2.07-3.91-3.52-4.35-1.46-.44-6.79-.27-8.63-.19-6.64.29-12.48.18-18.1,3.3-1.21.67-3.33,1.7-4.56,2.06-6.07,1.77-16.2,2.23-19.92-3.48-.37-.57-1.07-1.47-1.48-4.11l-.16-9.2-.03-8.71c-4.69,6.35-12.43,14.09-19.54,18.46-7.31,4.49-16.59,7.73-25.6,10.19q-3.42.93-7.81,1.68c-3.01.51-4.28-.09-3.4-.48,1.78-.78,12.34-2.96,18.04-4.98,15.72-5.57,21.98-8.65,33.53-22.05,3.02-3.5,4.59-7.66,4.91-10.16.4-3.1.39-5.02-.53-5.09-3.78-.3-12.87.28-17.42.05-1.35-.07-2.53-.71-1.13-1.25.31-.12,1.98-.14,2.99-.17,6.15-.17,15.13.81,17.96-3.29.48-.69,2.86-5.87,3.56-5.23l.14,7.8c0,.33.3.58.67.58h17.86s.03,2.77.03,2.77c.04.72-.7,1.28-1.15.91-2.01-1.68-7.24-1.83-10.57-1.6-2.12.15-2.13.11-5.72.22l-1.1-.03.75,28.98c0,.33-.16-.53,0,0,1.82,5.88,7.27,7.1,13.45,6.3,2.36-.31,4.11-1.41,6.05-2.16,3.5-1.34,8.4-2,12.17-2.43,5.3-.6,10.6-.39,15.92-.51.02,0,.04-.01.04-.03,3.92-7.87,16.75-8.18,24.52-11.75-.25-6.5,3.13-20.98-8.38-20.17-7.16.5-6.9,6.07-9.39,10.16-2.66,4.38-9.64,1.11-5.37-4.03,4.68-5.62,23.63-12.73,28.07-3.85,2.59,5.19.33,20.87.98,27.59.25,2.61.93,5.2,4.19,5.34,4.35.19,13.55-1.65,17.71-3.11,14.87-5.23,17.75-11.89,17.75-26.7,0-4.71-2.87-3.84-6.1-3.84-1.8,0-13.57.08-12.37.1,0,0-.83-.05-.97-.24-.08-.11-.11-.41.17-.59.66-.42.6-.63,11.61-1.28,4.42-.26,7.14-1.22,9.28-2.74,1.36-.96,1.83-1.6,2.57-2.99.25-.47,1.56-2.59,1.56-1.57v5.26c-.01.29-.12,1.45.2,1.44l18.28.06-.06,2.54c-.2.95-.94,1.11-1.26.74-1.85-2.14-7.01-1.38-9.75-1.33-1.94.03-7.42-.05-7.42-.05v.87s-.01,25.7-.01,25.7c.12,2.95.1,2.2.32,3.66,1.91,12.61,13.3,4.25,20.67,1.34,9.14-3.6,15.65-7.23,25.66-10.21,3.84-1.14,4.88-.99,4.88-1.41,0-3.63.4-12.42.4-16.2,0-3.39-1.69-3.57-5.45-3.57s-7.77-.31-11.28-.31c-.96,0-1.85,0-2.12-.12-.19-.08-.3-.66.34-.8,2.95-.66,5.24.21,12.58-.44,1.69-.15,2.95-.13,4.85-.81,1.49-.54,3.61-3.13,4.13-4.26.98-2.14,1.82-2.72,1.82-1.7,0,.96,0,4.88.01,6.24,0,.4.37.72.81.71l17.69.18-.07,2.74c-.15.5-.5.82-.93.75-1.53-.23,2.19-2.41-13.47-1.91M427.14,272.07c-7.65,2.41-10.06,7.87-11.4,14.77-.46,2.37-.85,8.81.59,10.67.31,2.59,15.48,5.54,26.81,6.66,3.17.31,5.84.23,6.37-.49,1.07-1.44,6.9-8.84,3.26-23.06-2.34-9.16-16.67-11.38-25.63-8.55ZM498.28,297.25c9.43-.46,15.67,1.89,26.65,6.64,1.92-.18,3.9-5.2,4.34-6.8,1.8-6.68,1.48-15.57-2.15-20.8-3.65-5.25-10.63-6.82-19.35-6.41-13.49.64-15.86,15.24-12.92,25.19.4,1.37,1.86,2.26,3.43,2.18ZM256.49,291.63c-5.81,3.11-18.97,4.49-19.07,11.9-.02,1.59,1.42,2.54,2.78,2.83,4.97,1.06,13.09-2.17,16.29-4.26v-10.48ZM496.97,299.14c3.73,9.19,17.89,12.51,26.42,6.52.02-.49-7.51-4.01-13.21-5.24-1.72-.37-6.37-1.49-8.67-1.24-.25.03-.51-.04-.76-.04h-3.78ZM447.59,306.22c-8.78-1.18-20.64-2.67-29.01-5.04,4.02,7.78,16.88,8.8,22.22,8.21,2.34-.26,5.7-.97,6.79-3.17ZM638.35,303.49c-5.03-.36-10.72,1.33-15.37,2.84-.34.11-.47-.01-.04.51,1,1.21,3.43,1.43,4.29,1.61,2.92.6,10.51-.31,11.12-4.96ZM701.38,305.74c-3.91-3.79-13.78-2.86-16.4-1.06,3.14,4.3,12.4,4.06,16.4,1.06Z"/></clipPath>
</defs>
<g clip-path="url(#oa-cp-S)">
  <path class="brush b-s" stroke-width="80" d="M 410 145 C 360 140, 345 158, 348 175 C 352 190, 405 188, 410 200 C 412 215, 358 220, 345 200"/>
</g>
<g clip-path="url(#oa-cp-i2)">
  <path class="brush b-i2" stroke-width="40" d="M 423 150 L 426 158"/>
</g>
<g clip-path="url(#oa-cp-i1)">
  <path class="brush b-i1" stroke-width="50" d="M 425 167 L 425 210"/>
</g>
<g clip-path="url(#oa-cp-a)">
  <path class="brush b-a" stroke-width="80" d="M 519 165 C 519 152, 462 152, 462 178 C 462 200, 510 200, 519 187 L 519 210"/>
</g>
<g clip-path="url(#oa-cp-tatt)">
  <path class="brush b-tatt" stroke-width="135" d="M 50 320 Q 200 305 350 320 T 600 320 T 820 320 T 1000 320"/>
  <path class="comet c-tatt" stroke-width="135" d="M 50 320 Q 200 305 350 320 T 600 320 T 820 320 T 1000 320"/>
</g>
<g class="ornaments" id="ornaments" style="--ink-bloom:0"></g>
<circle class="nib n-s"  r="3.2" cx="410" cy="145" fill="var(--ink)"/>
<circle class="nib n-i1" r="2.8" cx="425" cy="167" fill="var(--ink)"/>
<circle class="nib n-i2" r="2.4" cx="423" cy="150" fill="var(--ink)"/>
<circle class="nib n-a"  r="3.2" cx="519" cy="165" fill="var(--ink)"/>
<circle class="nib n-t"  r="3.0" cx="50"  cy="320" fill="var(--ink)" filter="url(#oa-meteor-glow)"/>
`

export default function OpeningAnimation({ style, className }) {
  const wrapRef = useRef(null)

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    const svg = wrap.querySelector('svg')
    if (!svg) return

    const STATE = { speed: 1.35, silk: 135, orn: 38, ink: '#f5f0ea' }
    const spread_val = 0.50
    const T = {
      s:    { dur: 0.95, delay: 0.30 },
      i2:   { dur: 0.18, delay: 1.30 },
      i1:   { dur: 0.55, delay: 1.55 },
      a:    { dur: 0.85, delay: 2.20 },
      tatt: { dur: 3.40, delay: 3.20 },
    }

    const brushes = [...svg.querySelectorAll('.brush,.comet')]
    brushes.forEach(p => {
      const L = Math.ceil(p.getTotalLength())
      p.style.setProperty('--len', L)
      p.dataset.len = L
    })

    const nibs = {
      s:    svg.querySelector('.n-s'),
      i1:   svg.querySelector('.n-i1'),
      i2:   svg.querySelector('.n-i2'),
      a:    svg.querySelector('.n-a'),
      tatt: svg.querySelector('.n-t'),
    }

    const ornG = svg.querySelector('#ornaments')
    const W = 870.82, H = 419.42, NS = 'http://www.w3.org/2000/svg'
    const cx = W / 2, cy = H / 2

    const inLogoZone = (x, y) => {
      if (x > 335 && x < 545 && y > 140 && y < 215) return true
      if (x > 40  && x < 835 && y > 250 && y < 320) return true
      return false
    }

    function generateStars() {
      while (ornG.firstChild) ornG.removeChild(ornG.firstChild)
      const pts = []
      pts.push({ x: 288, y: 175, depth: 0.78, tier: 'hero', fixed: true })
      pts.push({ x: 572, y: 170, depth: 0.82, tier: 'hero', fixed: true })
      pts.push({ x: 440, y: 120, depth: 0.72, tier: 'hero', fixed: true })
      let tries = 0
      while (pts.length < 9 && tries++ < 4000) {
        const x = cx + (Math.random() - 0.5) * W * spread_val
        const y = cy + (Math.random() - 0.5) * H * spread_val
        if (x < 14 || x > W - 14 || y < 14 || y > H - 14) continue
        if (inLogoZone(x, y)) continue
        if (x > 320 && x < 560 && y > 205 && y < 260) continue
        if (pts.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < 95 ** 2)) continue
        pts.push({ x, y, depth: Math.random() })
      }
      pts.filter(p => !p.fixed).forEach(p => (p.tier = 'medium'))
      const sh = [...pts.filter(p => !p.fixed)].sort(() => Math.random() - 0.5)
      for (let k = 0; k < Math.min(2, sh.length); k++) sh[k].tier = 'hero'
      return pts
    }

    function drawStars(pts) {
      for (const p of pts) {
        const isSpark = p.fixed ? true : Math.random() > 0.35
        if (isSpark) {
          const sizeMul = p.tier === 'hero' ? 1.05 : 0.78
          const armBase = (11.0 + p.depth * 6.0) * sizeMul
          const sw = p.tier === 'hero' ? 2.6 : 1.9
          const x = p.x, y = p.y, gap = armBase * 0.45
          const rayDList = []
          for (let i = 0; i < 4; i++) {
            const a = -Math.PI / 2 + i * (Math.PI / 2)
            const isMain = i % 2 === 0
            const len = armBase * (isMain ? (1.65 + Math.random() * 0.35) : (0.42 + Math.random() * 0.14))
            const cos = Math.cos(a), sin = Math.sin(a)
            const xs = x + cos * gap, ys = y + sin * gap
            const xe = x + cos * (gap + len), ye = y + sin * (gap + len)
            const mx = (xs + xe) / 2 + (-sin) * 0.08, my = (ys + ye) / 2 + cos * 0.08
            rayDList.push(`M${xs.toFixed(2)} ${ys.toFixed(2)} Q${mx.toFixed(2)} ${my.toFixed(2)} ${xe.toFixed(2)} ${ye.toFixed(2)}`)
          }
          rayDList.forEach((rd, i) => {
            const path = document.createElementNS(NS, 'path')
            path.setAttribute('d', rd)
            path.setAttribute('class', 'orn sparkle')
            path.style.strokeWidth = sw
            path.dataset.depth = p.depth.toFixed(2)
            path.style.setProperty('--rdelay', (i * 0.42 + Math.random() * 0.08) + 's')
            ornG.appendChild(path)
          })
        } else {
          const sizeMul = p.tier === 'hero' ? 0.95 : 0.72
          const base = (7.0 + p.depth * 4.0) * sizeMul
          const sV = base * 2.8, sH = base * 0.30, ww = base * 0.07
          const f = v => v.toFixed(2)
          const px = p.x, py = p.y
          const c = document.createElementNS(NS, 'path')
          c.setAttribute('d',
            `M ${f(px)} ${f(py - sV)} L ${f(px + ww)} ${f(py - ww)} L ${f(px + sH)} ${f(py)} L ${f(px + ww)} ${f(py + ww)} ` +
            `L ${f(px)} ${f(py + sV)} L ${f(px - ww)} ${f(py + ww)} L ${f(px - sH)} ${f(py)} L ${f(px - ww)} ${f(py - ww)} Z`)
          c.setAttribute('class', 'orn star')
          c.dataset.depth = p.depth.toFixed(2)
          c.dataset.solid = 'true'
          ornG.appendChild(c)
        }
      }
    }

    function applyOrn() {
      const op = STATE.orn / 100
      const starOp = Math.min(1, op * 1.7)
      ;[...svg.querySelectorAll('.orn')].forEach(el => {
        const isStar  = el.classList.contains('star') || el.classList.contains('sparkle')
        const isSolid = el.dataset.solid === 'true'
        const m = isSolid ? Math.min(1, op * 2.4) : isStar ? starOp : op * 0.55
        el.style.setProperty('--maxOp', m)
        if (!el.dataset.tdur) {
          const period = isStar ? (22.0 + Math.random() * 14.0) : (32.0 + Math.random() * 16.0)
          const phase  = isSolid ? -(0.18 + Math.random() * 0.20) * period : -Math.random() * period
          el.dataset.tdur   = period.toFixed(2)
          el.dataset.tdelay = phase.toFixed(2)
        }
        el.style.setProperty('--tdur',  el.dataset.tdur + 's')
        el.style.setProperty('--delay', el.dataset.tdelay + 's')
      })
    }

    function setTimings() {
      const k = 1 / STATE.speed
      Object.entries(T).forEach(([key, v]) => {
        [svg.querySelector('.b-' + key), svg.querySelector('.c-' + key)].forEach(b => {
          if (b) {
            b.style.setProperty('--dur',   (v.dur   * k) + 's')
            b.style.setProperty('--delay', (v.delay * k) + 's')
          }
        })
      })
    }

    function animateNib(key) {
      const nib   = nibs[key]; if (!nib) return
      const brush = svg.querySelector('.b-' + key); if (!brush) return
      const L     = parseFloat(brush.dataset.len)
      const dur   = parseFloat(brush.style.getPropertyValue('--dur'))   || 1
      const delay = parseFloat(brush.style.getPropertyValue('--delay')) || 0
      const t0    = performance.now()
      function tick(now) {
        const t = (now - t0) / 1000
        if (t < delay) { nib.style.opacity = 0; requestAnimationFrame(tick); return }
        const prog = Math.min(1, (t - delay) / dur)
        const pt   = brush.getPointAtLength(prog * L)
        nib.setAttribute('cx', pt.x); nib.setAttribute('cy', pt.y)
        nib.style.opacity = (prog < 0.04 || prog > 0.97) ? 0 : 1
        if (prog < 1) requestAnimationFrame(tick); else nib.style.opacity = 0
      }
      requestAnimationFrame(tick)
    }

    function start() {
      const orns = [...svg.querySelectorAll('.orn')]
      brushes.forEach(p => { p.style.animation = 'none'; p.style.strokeDashoffset = p.dataset.len })
      orns.forEach(p => { p.style.animation = 'none' })
      void svg.getBoundingClientRect()
      setTimings()
      svg.querySelector('.b-tatt').style.strokeWidth = STATE.silk
      wrap.style.setProperty('--ink', STATE.ink)
      applyOrn()
      brushes.forEach(p => { p.style.animation = '' })
      orns.forEach(p => { p.style.animation = '' })
    }

    drawStars(generateStars())
    start()
  }, [])

  return (
    <div
      ref={wrapRef}
      className={`oa-wrap${className ? ' ' + className : ''}`}
      style={style}
    >
      <style dangerouslySetInnerHTML={{ __html: ANIM_CSS }} />
      <div className="oa-stage">
        <svg
          className="oa-logo"
          viewBox="0 0 870.82 419.42"
          preserveAspectRatio="xMidYMid meet"
          dangerouslySetInnerHTML={{ __html: SVG_INNER }}
        />
      </div>
    </div>
  )
}
