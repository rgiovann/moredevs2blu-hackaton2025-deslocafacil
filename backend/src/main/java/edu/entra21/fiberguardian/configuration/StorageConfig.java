package edu.entra21.fiberguardian.configuration;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

import edu.entra21.fiberguardian.service.storage.MultiPartFileStorageService;
import edu.entra21.fiberguardian.service.storage.LocalMultiPartFileStorageService;
import edu.entra21.fiberguardian.service.storage.S3MultiPartFileStorageService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageConfig {

    private StorageProperties storageProperties;

    public StorageConfig(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Bean
    AmazonS3 amazonS3() {

        var credentials = new BasicAWSCredentials(
                storageProperties.getS3().getIdChaveAcesso(),
                storageProperties.getS3().getChaveAcessoSecreta());

        return AmazonS3ClientBuilder
                .standard()
                .withCredentials(new AWSStaticCredentialsProvider(credentials))
                .withRegion(storageProperties.getS3().getRegiao())
                .build();

    }

    @Bean
    MultiPartFileStorageService fotoStorageService() {
        if ( StorageProperties.TipoStorage.S3.equals(storageProperties.getTipo()) ){
            return new S3MultiPartFileStorageService(amazonS3(), storageProperties );
        }
        return new LocalMultiPartFileStorageService(storageProperties);

    }

}
