namespace ticketApi.Models;

public static class SchemaBuilder
{
    public static Gemini.SchemaProperty CreateStringProperty()
    {
        return new Gemini.SchemaProperty { Type = "STRING" };
    }
    
    public static Gemini.SchemaProperty CreateNumberProperty()
    {
        return new Gemini.SchemaProperty { Type = "NUMBER" };
    }
    
    public static Gemini.SchemaProperty CreateBooleanProperty()
    {
        return new Gemini.SchemaProperty { Type = "BOOLEAN" };
    }
    
    public static Gemini.SchemaProperty CreateArrayProperty(Gemini.SchemaProperty itemType)
    {
        return new Gemini.SchemaProperty 
        { 
            Type = "ARRAY",
            Items = itemType
        };
    }
    
    public static Gemini.SchemaProperty CreateObjectProperty(Gemini.SchemaProperties properties)
    {
        return new Gemini.SchemaProperty 
        { 
            Type = "OBJECT"
            // Note: Para objetos anidados necesitarías extender SchemaProperty
        };
    }
    
    public static Gemini.SchemaProperties CreateProperties(params (string name, Gemini.SchemaProperty property)[] properties)
    {
        var schemaProperties = new Gemini.SchemaProperties();
        foreach (var (name, property) in properties)
        {
            schemaProperties[name] = property;
        }
        return schemaProperties;
    }
}