package edu.entra21.fiberguardian.configuration;

import edu.entra21.fiberguardian.model.*;
import org.modelmapper.Converter;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.modelmapper.TypeMap;
import org.modelmapper.spi.MappingContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ModelMapperConfig {

    @Bean
    Mapper mapper() {
        final  ModelMapper modelMapper = new ModelMapper();

        modelMapper.getConfiguration()
                .setSkipNullEnabled(true);


        // Converter para Usuario
        Converter<String, Usuario> emailToUsuario = (MappingContext<String, Usuario> ctx) -> {
            Usuario u = new Usuario();
            u.setEmail(ctx.getSource());
            return u;
        };

        return new Mapper() {
            @Override
            public <D> D map(Object source, Class<D> destinationType) {
                return modelMapper.map(source, destinationType);
            }

            @Override
            public void map(Object source, Object destination) {
                modelMapper.map(source, destination);
            }
        };
    }

}