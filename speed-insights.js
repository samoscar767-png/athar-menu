/**
 * Vercel Speed Insights initialization
 * This file injects the Speed Insights tracking script
 */

// Initialize the Speed Insights queue
window.si = window.si || function() {
  (window.siq = window.siq || []).push(arguments);
};

// Inject the Speed Insights script
(function() {
  const script = document.createElement('script');
  script.defer = true;
  
  // Check if we're in development or production
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
  
  // Use debug script in development, production script otherwise
  if (isDevelopment) {
    script.src = 'https://va.vercel-scripts.com/v1/speed-insights/script.debug.js';
  } else {
    script.src = '/_vercel/speed-insights/script.js';
  }
  
  // Insert script into the document
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
})();
