import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Plugins register once, here, before anything uses them. Every module that
// animates imports from this file rather than from 'gsap' directly, so the
// registration can never be missed.
gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
