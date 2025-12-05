package edu.entra21.fiberguardian.controller;

import edu.entra21.fiberguardian.assembler.DeslocamentoDtoAssembler;
import edu.entra21.fiberguardian.assembler.DeslocamentoInputDisassembler;
import edu.entra21.fiberguardian.assembler.DeslocamentoPagedDtoAssembler;
import edu.entra21.fiberguardian.dto.DeslocamentoDto;
import edu.entra21.fiberguardian.dto.DeslocamentoPagedDto;
import edu.entra21.fiberguardian.dto.PageDto;
import edu.entra21.fiberguardian.input.DeslocamentoEdicaoInput;
import edu.entra21.fiberguardian.input.DeslocamentoInput;
import edu.entra21.fiberguardian.model.Deslocamento;
import edu.entra21.fiberguardian.service.DeslocamentoService;
import edu.entra21.fiberguardian.service.query.DeslocamentoFilter;
import edu.entra21.fiberguardian.service.query.DeslocamentoQueryService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(value = "/api/deslocamentos", produces = MediaType.APPLICATION_JSON_VALUE)
public class DeslocamentoController {

    private final DeslocamentoService deslocamentoService;
    private final DeslocamentoInputDisassembler deslocamentoInputDisassembler;
    private final DeslocamentoPagedDtoAssembler deslocamentoPagedDtoAssembler;
    private final DeslocamentoDtoAssembler deslocamentoDtoAssembler;
    private final DeslocamentoQueryService notaFiscalQueryService;

    private static final int TAMANHO_PAGINA_PADRAO = 10;
    private static final Sort ORDENACAO_PADRAO =
            Sort.by(Sort.Order.desc("dataSaida"));

    private static final Logger logger = LoggerFactory.getLogger(DeslocamentoController.class);

    public DeslocamentoController(DeslocamentoService deslocamentoService,
                                DeslocamentoPagedDtoAssembler deslocamentoPagedDtoAssembler,
                                DeslocamentoInputDisassembler deslocamentoInputDisassembler,
                                  DeslocamentoDtoAssembler deslocamentoDtoAssembler,
                                  DeslocamentoQueryService notaFiscalQueryService) {
        this.deslocamentoService = deslocamentoService;
        this.deslocamentoPagedDtoAssembler = deslocamentoPagedDtoAssembler;
        this.deslocamentoDtoAssembler = deslocamentoDtoAssembler;
        this.deslocamentoInputDisassembler = deslocamentoInputDisassembler;
        this.notaFiscalQueryService = notaFiscalQueryService;

    }


    @GetMapping(value = "/{deslocamentoId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public DeslocamentoDto buscar(@PathVariable Long deslocamentoId) {

        return deslocamentoDtoAssembler.toDto(deslocamentoService.buscarPorIdObrigatorio(deslocamentoId));

    }
    /*
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public PageDto<DeslocamentoPagedDto> listarPaginado(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, ORDENACAO_PADRAO);

        Page<Deslocamento> pagina = deslocamentoService.listarPaginado(pageable);
        List<DeslocamentoPagedDto> dtos = deslocamentoPagedDtoAssembler.toCollectionDto(pagina.getContent());

        PageDto<DeslocamentoPagedDto> dtoPaged = new PageDto<>();
        dtoPaged.setContent(dtos);
        dtoPaged.setPageNumber(pagina.getNumber());
        dtoPaged.setPageSize(pagina.getSize());
        dtoPaged.setTotalElements(pagina.getTotalElements());
        dtoPaged.setTotalPages(pagina.getTotalPages());
        dtoPaged.setLast(pagina.isLast());

        return dtoPaged;
    }
*/
    @GetMapping("/paged")
    public PageDto<DeslocamentoPagedDto> listarPaginado(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataini,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate datafim,
            @RequestParam(required = false) String emailUsuario,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        // Monta o filtro
        DeslocamentoFilter filtro = new DeslocamentoFilter();
        filtro.setDataSaidaDeslocamentoInicio(dataini);
        filtro.setDataSaidaDeslocamentoFim(datafim);
        filtro.setStatus(status);
        filtro.setEmailUsuario(emailUsuario);

        Pageable pageable = PageRequest.of(page, size, ORDENACAO_PADRAO);
        Page<Deslocamento> pagina = notaFiscalQueryService.consultarDeslocamentos(filtro,pageable);
        List<DeslocamentoPagedDto> dtos = deslocamentoPagedDtoAssembler.toCollectionDto(pagina.getContent());

        PageDto<DeslocamentoPagedDto> dtoPaged = new PageDto<>();
        dtoPaged.setContent(dtos);
        dtoPaged.setPageNumber(pagina.getNumber());
        dtoPaged.setPageSize(pagina.getSize());
        dtoPaged.setTotalElements(pagina.getTotalElements());
        dtoPaged.setTotalPages(pagina.getTotalPages());
        dtoPaged.setLast(pagina.isLast());

        return dtoPaged;
    }



    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeslocamentoDto adicionar(@RequestBody @Valid DeslocamentoInput deslocamentoInput) {
        Deslocamento deslocamento = deslocamentoInputDisassembler.toEntity(deslocamentoInput);
        deslocamento = deslocamentoService.salvar(deslocamento);
        return deslocamentoDtoAssembler.toDto(deslocamento);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        deslocamentoService.excluir(id);
    }

    @PatchMapping("/{id}/edicao")
    @ResponseStatus(HttpStatus.OK)
    public DeslocamentoDto atualizarCustoReal(
            @PathVariable Long id,
            @RequestBody DeslocamentoEdicaoInput input) {

        Deslocamento deslocamentoAtualizado = deslocamentoService.atualizarDeslocamento(id, input.getCustoReal(),input.getStatus(),input.getDataChegadaReal());
        return deslocamentoDtoAssembler.toDto(deslocamentoAtualizado);
    }
}
