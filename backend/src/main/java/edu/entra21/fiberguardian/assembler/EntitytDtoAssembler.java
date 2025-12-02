package edu.entra21.fiberguardian.assembler;

import java.lang.reflect.ParameterizedType;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import edu.entra21.fiberguardian.configuration.Mapper;
import lombok.Getter;

@Getter
public abstract class EntitytDtoAssembler<M, D> {

	private final Mapper mapper;
	private final Class<M> dtoObject;

	@SuppressWarnings("unchecked")
	public EntitytDtoAssembler(Mapper mapper) {
		ParameterizedType type = (ParameterizedType) getClass().getGenericSuperclass();
		this.mapper = mapper;
		this.dtoObject = (Class<M>) type.getActualTypeArguments()[0];
	}

	public M toDto(D entityObject) {
		return this.mapper.map(entityObject, this.dtoObject);
	}

	public List<M> toCollectionDto(Collection<D> listOfEntityObjects) {
		return listOfEntityObjects.stream().map(o -> this.toDto(o)).collect(Collectors.toList());
	}

}