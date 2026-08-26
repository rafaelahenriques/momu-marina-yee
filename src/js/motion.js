import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';

// Plugins register once, here, before anything uses them. Every module that
// animates imports from this file rather than from 'gsap' directly, so the
// registration can never be missed.
//
// Physics2DPlugin covers the scattering letters and InertiaPlugin the poke
// and the throwable corner — both ship with GSAP, so nothing on this page
// needs a separate physics engine loaded alongside it.
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  Draggable,
  InertiaPlugin,
  Physics2DPlugin
);

export { gsap, ScrollTrigger, SplitText, Draggable };
