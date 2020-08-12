const jwt = require('jsonwebtoken');

// MIDDLEWARE que verifica o token e extrai dele o id do usuario
module.exports = (req, res, next) => {
  // Pega o que está no header 'Authorization'
  const authHeader = req.get('Authorization');
  
  // Verifica se há algo no header 'Authorization'
  if (!authHeader) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }

  // Pega o token que está no header
  const token = authHeader.split(' ')[1]; // authHeader = 'Bearer  [token]
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'somesupersecretsecret');
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  if (!decodedToken) {
    const error = new Error('Not authenticated.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};


// Envia requisição POST para a rota de login;
// No seu controller, busca um usuario que possua um email cadastrado no BD q corresponda ao digitado no momento do login
// Se esse usuario existir, compare a senha digitada com a senha deste usuario cadastrada no banco
// Se a senha corresponder, cria-se um Token JWT com o email e id do user, e o envia como resposta (res.json()) junto com o id deste user

// O frontend vai receber o token (e armazená-lo em um useState, por exemplo) e o id quando fizer a requisicao a rota de login
// Em cada outra requisiçao em que seja necessário estar logado, esse Token deve ser setado no header 'Authorization'

// cria-se um middleware no node.js que deve ser o primeiro a ser chamado em cada requisicao que seja necessario estar logado
// esse middlware vai pegar o Token que está no header da requisicao (req.get('Authorization'))
// em seguida vai decodificar o token, verificando a sua validade (decodedToken = jwt.verify(token, 'secret');)
// Se esse Token nao conseguir ser decodificado, retorna erro 401; 
// caso contrário, o Token é valido, armazena-se o ID do usuario req.userId = decodedToken.userId
//  e chama-se o proximo middleware (next();)