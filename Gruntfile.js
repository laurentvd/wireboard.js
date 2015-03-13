module.exports = function(grunt) {
	
	var srcScripts= [
		'src/extend.js',
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
				separator: ';\n\n'
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
		copy: {
			distToDemo: {
				files: [{expand: true, flatten: true, src: ['dist/**'], dest: 'demo/js/', filter: 'isFile'}]
			}
		},
		watch: {
			files: allScriptsGlobs,
			tasks: ['build']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Register the build (default) and publish task
	grunt.registerTask('publish', ['jshint', 'uglify', 'copy']);
	grunt.registerTask('build', ['jshint', 'concat']);
	grunt.registerTask('default', ['build']);
};