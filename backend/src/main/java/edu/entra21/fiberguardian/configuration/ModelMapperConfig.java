package edu.entra21.fiberguardian.configuration;

import edu.entra21.fiberguardian.dto.DeslocamentoPagedDto;
import edu.entra21.fiberguardian.input.DeslocamentoInput;
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

        // Mapeamento de Deslocamento -> DeslocamentoInput
        modelMapper.createTypeMap(DeslocamentoInput.class, Deslocamento.class)
                .addMappings(m -> {
                    m.using(emailToUsuario).map(DeslocamentoInput::getUsuario, Deslocamento::setUsuario);
                });


        // Mapeamento de Deslocamento -> DeslocamentoPagedDto
        // flat para email e nome de usuario
        modelMapper.addMappings(new PropertyMap<Deslocamento, DeslocamentoPagedDto>() {
            @Override
            protected void configure() {
                // Usuario
                map().setEmailUsuario(source.getUsuario().getEmail());
                map().setNomeUsuario(source.getUsuario().getNome());

            }
        });




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