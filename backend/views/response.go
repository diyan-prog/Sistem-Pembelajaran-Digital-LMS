package views

import "github.com/labstack/echo/v4"

type ErrorResp struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Error   *ErrorResp  `json:"error"`
	Meta    interface{} `json:"meta"`
}

func Success(c echo.Context, code int, data interface{}, meta interface{}) error {
	return c.JSON(code, APIResponse{Success: true, Data: data, Meta: meta})
}

func Fail(c echo.Context, code int, errorCode, message string) error {
	return c.JSON(code, APIResponse{
		Success: false,
		Error:   &ErrorResp{Code: errorCode, Message: message},
	})
}

// Legacy menulis bentuk respons lama yang belum dibungkus.
// deprecated: dipakai hanya untuk alias endpoint lama.
func Legacy(c echo.Context, code int, data interface{}) error {
	return c.JSON(code, data)
}

func NoContent(c echo.Context, code int) error { return c.NoContent(code) }
