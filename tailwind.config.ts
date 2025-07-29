import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					glow: 'hsl(var(--secondary-glow))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				coffee: {
					DEFAULT: 'hsl(var(--coffee))',
					light: 'hsl(var(--coffee-light))'
				},
				neon: {
					green: 'hsl(var(--neon-green))'
				},
				victory: {
					gold: 'hsl(var(--victory-gold))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-turbo': 'var(--gradient-turbo)',
				'gradient-electric': 'var(--gradient-electric)',
				'gradient-road': 'var(--gradient-road)',
				'gradient-speed': 'var(--gradient-speed)'
			},
			boxShadow: {
				'neon': 'var(--shadow-neon)',
				'electric': 'var(--shadow-electric)',
				'glow': 'var(--shadow-glow)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)',
				'bounce': 'var(--transition-bounce)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-neon': {
					'0%, 100%': {
						boxShadow: '0 0 5px hsl(var(--primary)), 0 0 10px hsl(var(--primary)), 0 0 15px hsl(var(--primary))'
					},
					'50%': {
						boxShadow: '0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary)), 0 0 30px hsl(var(--primary))'
					}
				},
				'drift-left': {
					'0%': { transform: 'translateX(0) rotateZ(0deg)' },
					'50%': { transform: 'translateX(-10px) rotateZ(-2deg)' },
					'100%': { transform: 'translateX(0) rotateZ(0deg)' }
				},
				'drift-right': {
					'0%': { transform: 'translateX(0) rotateZ(0deg)' },
					'50%': { transform: 'translateX(10px) rotateZ(2deg)' },
					'100%': { transform: 'translateX(0) rotateZ(0deg)' }
				},
				'speed-lines': {
					'0%': { transform: 'translateX(100px)', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { transform: 'translateX(-100px)', opacity: '0' }
				},
				'road-scroll': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-200px)' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3)', opacity: '0' },
					'50%': { transform: 'scale(1.1)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
				'drift-left': 'drift-left 0.3s ease-out',
				'drift-right': 'drift-right 0.3s ease-out',
				'speed-lines': 'speed-lines 0.8s linear infinite',
				'road-scroll': 'road-scroll 2s linear infinite',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
