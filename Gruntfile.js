module.exports = function(grunt) {
	
	var srcScripts= [
		'src/namespace.js',
		'src/es6-poly.js',
		'src/extend.js',
		'src/Util.js',
		'src/Event.js',
		'src/EventDispatcher.js',
		'src/Command.js',
		'src/CommandMap.js',
		'src/View.js',
		'src/ViewMap.js',
		'src/ViewMapping.js',
		'src/ViewMediator.js',
		'src/Context.js',
	];

	var srcScriptsGlob = 'src/**/*.js';
	var testScriptsGlob = 'test/**/*.js';
	var allScriptsGlobs = [srcScriptsGlob, testScriptsGlob];

	grunt.initConfig({
		jshint: {
			files: allScriptsGlobs,
			options: {
				globals: {
					jQuery: true
				}
			}
		},
		concat: {
			options: {
				separator: ';\n\n',
				sourceMap: true
			},
			dist: {
				src: srcScripts,
				dest: 'dist/js/wireboard.js'
			}
		},
		uglify: {
			dist: {
				files: {
					'dist/js/wireboard.min.js': srcScripts
				}
			},
			options: {}
		},
		'http-server': {
			development: {
				root: 'demo/',
				port: 8000,
				runInBackground: true
			}
		},
		copy: {
			distToDemo: {
				files: [{expand: true, flatten: true, src: ['dist/**'], dest: 'demo/assets/js/', filter: 'isFile'}]
			}
		},
		watch: {
			files: allScriptsGlobs,
			options: {
				livereload: true
			},
			tasks: ['build']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-http-server');

	// Register the build (default) and publish task
	grunt.registerTask('publish', ['jshint', 'uglify', 'copy']);
	grunt.registerTask('build', ['jshint', 'concat', 'copy']);
	grunt.registerTask('development', ['build', 'http-server', 'watch']);
	grunt.registerTask('default', ['development']);
};