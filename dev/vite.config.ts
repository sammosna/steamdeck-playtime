import { spawn } from 'node:child_process'
import path from 'node:path'
import { defineConfig, Plugin } from 'vite'

/** Starts the Python dev backend together with the dev server. */
function pythonBackend(): Plugin {
    return {
        name: 'python-backend',
        configureServer(server) {
            const child = spawn('python3', [path.resolve(__dirname, 'server.py')], {
                stdio: 'inherit',
            })
            server.httpServer?.on('close', () => child.kill())
            process.on('exit', () => child.kill())
        },
    }
}

export default defineConfig({
    root: __dirname,
    plugins: [pythonBackend()],
    resolve: {
        alias: { 'decky-frontend-lib': path.resolve(__dirname, 'dfl-stub.tsx') },
    },
    esbuild: {
        jsx: 'transform',
        jsxFactory: 'window.SP_REACT.createElement',
        jsxFragment: 'window.SP_REACT.Fragment',
    },
    server: { proxy: { '/api': 'http://127.0.0.1:18787' } },
})
