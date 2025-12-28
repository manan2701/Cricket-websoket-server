let resultCache = [];

const cache = {
    set: (data) => {
        resultCache = data;
    },
    get: () => resultCache,
    clear: () => {
        resultCache = [];
    }
};

module.exports = cache;