let rankingsCache = [];

const cache = {
    set: (data) => {
        rankingsCache = data;
    },
    get: () => rankingsCache,
    clear: () => {
        rankingsCache = [];
    }
};

module.exports = cache;