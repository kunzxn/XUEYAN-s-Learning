using Microsoft.Data.SqlClient;
public sealed class ApiErrorsMiddleware(RequestDelegate next,ILogger<ApiErrorsMiddleware> logger) {
 public async Task InvokeAsync(HttpContext context){

    try { await next(context); }
    catch (ApiError e) { context.Response.StatusCode=e.Status; await context.Response.WriteAsJsonAsync(new {error=e.Message,fields=e.Fields}); }
    catch (BadHttpRequestException e) { context.Response.StatusCode=e.StatusCode; await context.Response.WriteAsJsonAsync(new{error=e.StatusCode==413?"Yêu cầu vượt quá giới hạn 64 KiB.":"Yêu cầu HTTP không hợp lệ."}); }
    catch (SqlException e) { context.Response.StatusCode=e.Number is 2601 or 2627 or 547 or 51013 or 51022?409:e.Number is 51021 or 51012?404:503; await context.Response.WriteAsJsonAsync(new {fields=e.Number is 2601 or 2627 ? new Dictionary<string,string[]>{{context.Request.Path.Value is "/auth/register" or "/admin/users"?"email":"slug",["Giá trị đã tồn tại. Vui lòng chọn giá trị khác."]}}:null,error=e.Number is 2601 or 2627?"Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.":e.Number==547?"Bản ghi đang được sử dụng hoặc dữ liệu liên quan không hợp lệ. Hãy lưu trữ thay vì xóa.":e.Number==51013?"Không thể vô hiệu hóa admin hoạt động cuối cùng.":e.Number==51022?"Lượt học này đã được lưu với kết quả khác. Hãy tải lại để xem dữ liệu đã lưu.":e.Number==51012?"Tài khoản không còn tồn tại.":e.Number==51021?"Từ vựng không còn khả dụng để học.":"Không thể kết nối hoặc cập nhật SQL Server. Vui lòng thử lại."}); }
    catch (Exception e) { logger.LogError(e,"Request failed"); context.Response.StatusCode=500; await context.Response.WriteAsJsonAsync(new {error="Không thể hoàn tất thao tác. Dữ liệu chưa được xác nhận lưu."}); }
}
}
