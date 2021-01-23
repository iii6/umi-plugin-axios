import http, { AxiosResponse } from 'axios';
import { message } from 'antd';
import store from 'storejs';

// 全局错误拦截
const errCode: any = {
  400: '请求错误',
  401: '未授权，请登录',
  403: '拒绝访问',
  404: '请求出错',
  405: '请求错误',
  408: '请求超时',
  419: '认证超时',
  422: '认证失败',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
  505: 'HTTP版本不受支持',
};

const Instance = http.create({
  baseURL: '{{{ baseURL }}}',
  headers: {
    Authorization: store('?token') ? `Bearer ${store('token')}`: ''
  },
})

Instance.interceptors.response.use(response => {
  const { status, data } = response;
  if ((data.code === 200 || status === 200) && data.message) {
    message.destroy();
    message.success(data.message);
  }

  return data;
}, error => {
  const { data, status } = error.response as AxiosResponse;
  let err;

  // 登录过期
  if (status === 401 || data.code === 401) {
    store.remove('token');
    errCode[401];
    return location.href = '{{{ exclude }}}';
  }

  if (data.message) {
    err = data.message;
  } else {
    err = errCode[status];
  }

  err = {
    message: err,
  };

  return Promise.reject(err);
});

Instance.interceptors.request.use(c => {
  if (store('?token')) {
    c.headers.Authorization = `Bearer ${store('token')}`;
  }

  return c;
}, error => {
  return Promise.reject(error);
});

const axios = Instance;

export { axios }
