import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Plugins register once, before anything uses them.
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };
