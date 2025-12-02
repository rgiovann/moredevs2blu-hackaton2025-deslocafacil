package edu.entra21.fiberguardian.service.storage;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import edu.entra21.fiberguardian.configuration.StorageProperties;
import edu.entra21.fiberguardian.exception.exception.StorageException;

import java.net.URL;

public class S3MultiPartFileStorageService implements MultiPartFileStorageService {

    private final AmazonS3 amazonS3;
    private final StorageProperties storageProperties;

    public S3MultiPartFileStorageService(AmazonS3 amazonS3, StorageProperties storageProperties) {
        this.amazonS3 = amazonS3;
        this.storageProperties = storageProperties;
    }

    @Override
    public void armazenar(NovoMultipartFile novoMultiPartFile) {
        try {
            var objectMetadata = new ObjectMetadata();

            objectMetadata.setContentType(novoMultiPartFile.getContentType());

            var putObjectRequest = new PutObjectRequest(storageProperties.getS3().getBucket(),
                    getCaminhoArquivo(novoMultiPartFile.getNomeArquivo() ),
                    novoMultiPartFile.getInputStream(), objectMetadata)
                    .withCannedAcl(CannedAccessControlList.PublicRead);
            this.amazonS3.putObject(putObjectRequest);
        } catch (Exception e) {
            throw new StorageException("Não foi possível enviar arquivo para Amazon S3", e);
        }
    }

    @Override
    public void remover(String nomeArquivo) {
        try {

            String caminhoArquivo = this.getCaminhoArquivo(nomeArquivo);
            String bucket         = this.storageProperties.getS3().getBucket();

            var deleteObjectRequest = new DeleteObjectRequest(bucket, caminhoArquivo );
            this.amazonS3.deleteObject(deleteObjectRequest);
        }
        catch (Exception e) {
            throw new StorageException("Não foi possível enviar arquivo para Amazon S3", e);
        }

    }

    @Override
    public MultiPartFileRecuperado recuperar(String nomeArquivo) {

        String caminhoArquivo = this.getCaminhoArquivo(nomeArquivo);

        String bucket = this.storageProperties.getS3().getBucket();

        URL url = this.amazonS3.getUrl(bucket, caminhoArquivo);

        return MultiPartFileRecuperado.builder()
                .url(url.toString())
                .build();
    }

    private String getCaminhoArquivo( String nomeArquivo) {
        return String.format("%s/%s", this.storageProperties.getS3().getDiretorioFotos(),nomeArquivo);
    }

}
