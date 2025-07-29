def get_serializer_fields_metadata(serializer_class):
    fields = []
    serializer = serializer_class()

    for field_name, field in serializer.fields.items():
        label = getattr(field, 'label', None) or field_name.replace('_', ' ').capitalize()
        field_type = field.__class__.__name__

        fields.append({
            "label": label,
            "field": field_name,
            "type": field_type,
        })

    return fields
