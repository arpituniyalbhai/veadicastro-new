export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - images, icons, fonts, styles
     * - blog (static blog pages)
     * - wasm files (WebAssembly modules)
     * - xml and txt files (for Google Search Console bots)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|blog|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|woff|woff2|ttf|eot|wasm|xml|txt)).*)',
  ],
};