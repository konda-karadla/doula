import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
import logging
from typing import BinaryIO

from app.core.config import settings

logger = logging.getLogger(__name__)


class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            config=Config(signature_version='s3v4')
        )
        self.bucket_name = settings.S3_BUCKET_NAME

    def generate_key(self, system_id: str, user_id: str, filename: str) -> str:
        return f"labs/{system_id}/{user_id}/{filename}"

    async def upload_file(self, file_data: bytes, filename: str, s3_key: str) -> dict:
        try:
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=s3_key,
                Body=file_data,
                ContentType='application/pdf'
            )

            url = f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"

            logger.info(f"File uploaded to S3: {s3_key}")
            return {"key": s3_key, "url": url}
        except ClientError as e:
            logger.error(f"Error uploading file to S3: {e}")
            raise

    async def get_presigned_url(self, s3_key: str, expiration: int = 3600) -> str:
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            logger.error(f"Error generating presigned URL: {e}")
            raise

    async def delete_file(self, s3_key: str):
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            logger.info(f"File deleted from S3: {s3_key}")
        except ClientError as e:
            logger.error(f"Error deleting file from S3: {e}")
            raise
