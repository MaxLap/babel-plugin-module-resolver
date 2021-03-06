/* eslint-env mocha */
import assert from 'assert';
import { transform } from 'babel-core'; // eslint-disable-line import/no-extraneous-dependencies
import plugin from '../src';

function testRequireImport(source, output, transformerOpts) {
    it('with a require statement', () => {
        const code = `var something = require("${source}");`;
        const result = transform(code, transformerOpts);

        assert.strictEqual(result.code, `var something = require("${output}");`);
    });

    it('with an import statement', () => {
        const code = `import something from "${source}";`;
        const result = transform(code, transformerOpts);

        assert.strictEqual(result.code, `import something from "${output}";`);
    });
}

describe('root', () => {
    const transformerOpts = {
        plugins: [
            [plugin, {
                root: ['./test/examples/components']
            }]
        ]
    };

    describe('should rewrite the file path inside a root directory', () => {
        testRequireImport(
            'c1',
            './test/examples/components/c1',
            transformerOpts
        );
    });

    describe('should rewrite the sub file path inside a root directory', () => {
        testRequireImport(
            'sub/sub1',
            './test/examples/components/sub/sub1',
            transformerOpts
        );
    });

    describe('should rewrite the file while keeping the extension', () => {
        testRequireImport(
            'sub/sub1.css',
            './test/examples/components/sub/sub1.css',
            transformerOpts
        );
    });

    describe('should rewrite the file with a filename containing a dot', () => {
        testRequireImport(
            'sub/custom.modernizr3',
            './test/examples/components/sub/custom.modernizr3',
            transformerOpts
        );
    });

    describe('should not rewrite a path outisde of the root directory', () => {
        testRequireImport(
            'example-file',
            'example-file',
            transformerOpts
        );
    });
});

describe('alias', () => {
    const transformerOpts = {
        plugins: [
            [plugin, {
                alias: {
                    utils: './src/mylib/subfolder/utils',
                    'awesome/components': './src/components',
                    abstract: 'npm:concrete',
                    underscore: 'lodash'
                }
            }]
        ]
    };

    describe('should alias a known path', () => {
        describe('using a simple exposed name', () => {
            describe('when requiring the exact name', () => {
                testRequireImport(
                    'utils',
                    './src/mylib/subfolder/utils',
                    transformerOpts
                );
            });

            describe('when requiring a sub file of the exposed name', () => {
                testRequireImport(
                    'utils/my-util-file',
                    './src/mylib/subfolder/utils/my-util-file',
                    transformerOpts
                );
            });
        });

        describe('using a "complex" exposed name', () => {
            describe('when requiring the exact name', () => {
                testRequireImport(
                    'awesome/components',
                    './src/components',
                    transformerOpts
                );
            });

            describe('when requiring a sub file of the exposed name', () => {
                testRequireImport(
                    'awesome/components/my-comp',
                    './src/components/my-comp',
                    transformerOpts
                );
            });
        });

        describe('with a dot in the filename', () => {
            testRequireImport(
                'utils/custom.modernizr3',
                './src/mylib/subfolder/utils/custom.modernizr3',
                transformerOpts
            );
        });
    });

    describe('should alias the path with its extension', () => {
        testRequireImport(
            'awesome/components/my-comp.css',
            './src/components/my-comp.css',
            transformerOpts
        );
    });

    describe('should not alias a unknown path', () => {
        describe('when requiring a node module', () => {
            testRequireImport(
                'other-lib',
                'other-lib',
                transformerOpts
            );
        });

        describe('when requiring a specific un-mapped file', () => {
            testRequireImport(
                './l/otherLib',
                './l/otherLib',
                transformerOpts
            );
        });
    });

    describe('(legacy) should support aliasing a node module with "npm:"', () => {
        testRequireImport(
            'abstract/thing',
            'concrete/thing',
            transformerOpts
        );
    });

    describe('should support aliasing a node modules', () => {
        testRequireImport(
            'underscore/map',
            'lodash/map',
            transformerOpts
        );
    });
});
