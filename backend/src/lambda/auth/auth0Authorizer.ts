import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')


// to verify JWT token signature
const jwksUrl = 'https://dev-86riobz6.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  const certificate = await getCertificate(jwksUrl);

  if(!certificate) {
    throw new Error('Invalid certificate');
  }
  
  return verify(token, certificate, {algorithms: ['RS256']}) as JwtPayload;
  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  // return verify(token, signingKey) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}


async function getCertificate(jwksUrl: string){
  try{
    const response = await Axios.get(jwksUrl);
    const key = response['data']['keys'][0]['x5c'][0];
    const cert = `-----BEGIN CERTIFICATE-----\n${key}\n-----END CERTIFICATE-----`;
    return cert
  }
  catch (error){
    logger.error('Getting certificate failed', error)
   }
}


// async function getJwks(kid){
//  const resp = await Axios.get(jwksUrl);
//  const keys = resp.data.keys;
//  const signingKeys = keys.filter(key => key.use === 'sig' && key.kty === 'RSA' && key.kid  && ((key.x5c && key.x5c.length) || (key.n && key.e))).map(key => {
//   return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
// });
// const signingKey = signingKeys.find(key => key.kid === kid);
// return signingKey;
// }

// export function certToPEM(cert) {
//   cert = cert.match(/.{1,64}/g).join('\n');
//   cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
//   return cert;
// }
