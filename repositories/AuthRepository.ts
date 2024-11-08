export default {
    login(payload: any) {
        return $fetch('/api/login', {
            method: 'post',
            body: {
                email: payload.email,
                password: payload.password,
            }
        });
    },
};
