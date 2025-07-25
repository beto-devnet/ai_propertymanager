using System.Text.Json.Serialization;

namespace ticketApi.Models;

using System.Reflection;

public static class ReflectionSchemaBuilder
{
    public static Gemini.GenerationConfig CreateSchemaFromType<T>() where T : class
    {
        var properties = CreatePropertiesFromType<T>();
        var propertyNames = typeof(T).GetProperties()
            .Select(p => p.GetCustomAttribute<JsonPropertyNameAttribute>()?.Name ?? p.Name.ToLowerInvariant())
            .ToArray();
        
        return new Gemini.GenerationConfig
        {
            MimeType = "application/json",
            ResponseSchema = new Gemini.ResponseSchema
            {
                Type = "ARRAY",
                Items = new Gemini.SchemaItems
                {
                    Type = "OBJECT",
                    Properties = properties,
                }
            }
        };
    }
    
    private static Gemini.SchemaProperties CreatePropertiesFromType<T>()
    {
        var properties = new Gemini.SchemaProperties();
        var type = typeof(T);
        
        foreach (var prop in type.GetProperties())
        {
            var jsonName = prop.GetCustomAttribute<JsonPropertyNameAttribute>()?.Name ?? prop.Name.ToLowerInvariant();
            properties[jsonName] = GetSchemaPropertyFromType(prop.PropertyType);
        }
        
        return properties;
    }
    
    private static Gemini.SchemaProperty GetSchemaPropertyFromType(Type type)
    {
        if (type == typeof(string))
            return SchemaBuilder.CreateStringProperty();
        
        if (type == typeof(int) || type == typeof(double) || type == typeof(float) || type == typeof(decimal))
            return SchemaBuilder.CreateNumberProperty();
        
        if (type == typeof(bool))
            return SchemaBuilder.CreateBooleanProperty();
        
        if (type.IsArray)
        {
            var elementType = type.GetElementType();
            return SchemaBuilder.CreateArrayProperty(GetSchemaPropertyFromType(elementType));
        }
        
        // Para tipos más complejos, podrías expandir esta lógica
        return SchemaBuilder.CreateStringProperty(); // fallback
    }
}