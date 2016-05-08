module.exports = {
    dist: {
        src: ['./index.html'],
        overwrite: true,
        replacements: [{
            from: './node_packages',
            to: '..'
        }]
    }
};
