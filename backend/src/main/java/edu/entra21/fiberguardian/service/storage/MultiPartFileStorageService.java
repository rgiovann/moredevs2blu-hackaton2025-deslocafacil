package edu.entra21.fiberguardian.service.storage;

import java.io.InputStream;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
public interface MultiPartFileStorageService {

    void armazenar(NovoMultipartFile novoMultiPartFile);

    void remover(String nomeArquivo);

    MultiPartFileRecuperado recuperar(String nomeArquivo);

    default String gerarNomeArquivo(String nomeOriginal) {
        return UUID.randomUUID().toString() + "_" + nomeOriginal;
    }

    @Getter
    @Builder
    class NovoMultipartFile {

        private String nomeArquivo;
        private String contentType;
        private InputStream inputStream;

    }


    @Getter
    @Builder
    class MultiPartFileRecuperado {

        private InputStream inputStream;
        private String url;

        public  boolean temUrl() {
            return url != null;
        }

        public  boolean temInpuStream() {
            return inputStream != null;
        }

    }

    default void substituir(String nomeArquivoAntigo, NovoMultipartFile novoMultipartFile) {

        this.armazenar(novoMultipartFile);

        if(nomeArquivoAntigo != null) {
            this.remover(nomeArquivoAntigo);
        }

    };

}