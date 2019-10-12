const Request = require('request').defaults({jar: true});

let timeout = 1000;
let lastId = 2073673;

function login(id, pw) {
  const request = {
    url: 'https://manamoa.net/bbs/login_check.php',
    method: 'post',
    formData: {
      url: '$2F',
      mb_id: id,
      mb_password: pw,
    },
    timeout: 6000,
  };

  return new Promise((resolve, reject) => {
    Request(request, (error) => {
      if (error) {
        console.error(error);
        reject(false)
      } else {
        resolve(true);
      }
    });
  });
}

function list() {
  const request = {
    url: 'https://manamoa.net/bbs/board.php?bo_table=manga',
    method: 'get',
    formData: {
    },
  };

  return new Promise((resolve, reject) => {
    Request(request, (error, response, body) => {
      if (error) {
        console.error(error);
        reject(false)
      } else {
        const term = 'href="/bbs/board.php?bo_table=manga&wr_id=';
        const start = body.indexOf(term) + term.length;
        const end = body.indexOf('"', start);

        const id = body.slice(start, end);
        resolve(id);
      }
    });
  });
}

function getToken() {
  const request = {
    url: 'https://manamoa.net/bbs/ajax.comment_token.php',
    method: 'get',
  };

  return new Promise((resolve, reject) => {
    Request(request, (error, response, body) => {
      if (error) {
        console.error(error);
        reject(false)
      } else {
        try {
          const obj = JSON.parse(body);
          resolve(obj.token);
        } catch (error) {
          reject(false);
        }
      }
    });
  });
}

function comment(id, token, content) {
  const request = {
    url: 'https://manamoa.net/bbs/write_comment_update.php',
    method: 'post',
    formData: {
      w: 'c',
      bo_table: 'manga',
      wr_id: id,
      comment_id: '',
      pim: '',
      sca: '',
      sfl: '',
      stx: '',
      spt: '',
      page: '',
      is_good: 0,
      wr_content: content,
      token: token,
    },
  };

  return new Promise((resolve, reject) => {
    Request(request, (error) => {
      if (error) {
        console.error(error);
        reject(false)
      } else {
        resolve(true);
      }
    });
  });
}

async function handler() {
  timeout = Math.random() * 6000;
  timeout = (timeout < 1000) ? (1000) : (timeout);

  console.log('timeout:', timeout);

  try {
    const id = await list();

    if (id > lastId) {
      // 토큰 가져오기
      const token = await getToken();
      console.info('id:', id);
      console.info('token:', token);

      // 댓글 달기
      const result = await comment(id, token, '감사합니다');
      console.info('result:', result);

      lastId = id;
    }
  } catch(error) {
    console.error(error);
  }

  setTimeout(handler, timeout);
}

(async () => {
  try {
    const ret = await login('m3lee', 'Othila123@');

    if (ret) {
      setTimeout(handler, timeout);
    }
  } catch (error) {
    console.error(error);
  }
})();
