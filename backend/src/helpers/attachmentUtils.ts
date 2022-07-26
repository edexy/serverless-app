import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger';

// TODO: Implement the fileStogare logic
const XAWS = AWSXRay.captureAWS(AWS);
const logger = createLogger('attachmentAccess');


export class AttachmentAccess {
  constructor(
    private s3 = new XAWS.S3({
        signatureVersion: 'v4'
      }),
    private bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private urlExpiration = process.env.SIGNED_URL_EXPIRATION){
  }
    // Generates an AWS signed URL for uploading objects
   async getPutSignedUrl( key: string ) {
    return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: key,
        Expires: parseInt(this.urlExpiration)
      })
    }

  getImageUrl(todoId: string){
      const url = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`;
      logger.info('getImageUrl', {imageUrl: url});
      return url;
  }
}