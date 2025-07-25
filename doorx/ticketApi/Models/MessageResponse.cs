namespace ticketApi.Models;

public class MessageResponse<T> where T : class
{
    private string Text { get; set; }
    private string DeliveryTime { get; set; }
    private T Data { get; set; }
    
    public MessageResponse<T> AddText(string text)
    {
        Text = text;
        return this;
    }

    public MessageResponse<T> AddDeliveryTime()
    {
        DeliveryTime = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        return this;
    }

    public MessageResponse<T> AddData(T data)
    {
        Data = data;
        return this;
    }

    // public MessageResponse<T> Build()
    // {
    //     return this;
    // }
}