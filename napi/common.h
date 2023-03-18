#include <js_native_api.h>

#if !defined(COMMON_H_)
#define COMMON_H_
// Empty value so that macros here are able to return NULL or void
#define NODE_API_RETVAL_NOTHING  // Intentionally blank #define

#define GET_AND_THROW_LAST_ERROR(env)                                    \
  do {                                                                   \
    const napi_extended_error_info *error_info;                          \
    napi_get_last_error_info((env), &error_info);                        \
    bool is_pending;                                                     \
    napi_is_exception_pending((env), &is_pending);                       \
    /* If an exception is already pending, don't rethrow it */           \
    if (!is_pending) {                                                   \
      const char* error_message = error_info->error_message != NULL ?    \
        error_info->error_message :                                      \
        "empty error message";                                           \
      napi_throw_error((env), NULL, error_message);                      \
    }                                                                    \
  } while (0)

#define NODE_API_ASSERT_BASE(env, assertion, message, ret_val)           \
  do {                                                                   \
    if (!(assertion)) {                                                  \
      napi_throw_error(                                                  \
          (env),                                                         \
        NULL,                                                            \
          "assertion (" #assertion ") failed: " message);                \
      return ret_val;                                                    \
    }                                                                    \
  } while (0)

// Returns NULL on failed assertion.
// This is meant to be used inside napi_callback methods.
#define NODE_API_ASSERT(env, assertion, message)                         \
  NODE_API_ASSERT_BASE(env, assertion, message, NULL)

// Returns empty on failed assertion.
// This is meant to be used inside functions with void return type.
#define NODE_API_ASSERT_RETURN_VOID(env, assertion, message)             \
  NODE_API_ASSERT_BASE(env, assertion, message, NODE_API_RETVAL_NOTHING)

#define NODE_API_CALL_BASE(env, the_call, ret_val)                       \
  do {                                                                   \
    if ((the_call) != napi_ok) {                                         \
      GET_AND_THROW_LAST_ERROR((env));                                   \
      return ret_val;                                                    \
    }                                                                    \
  } while (0)

// Returns NULL if the_call doesn't return napi_ok.
#define NODE_API_CALL(env, the_call)                                     \
  NODE_API_CALL_BASE(env, the_call, NULL)

// Returns empty if the_call doesn't return napi_ok.
#define NODE_API_CALL_RETURN_VOID(env, the_call)                         \
  NODE_API_CALL_BASE(env, the_call, NODE_API_RETVAL_NOTHING)

#define DECLARE_NODE_API_PROPERTY(name, func)                            \
  { (name), NULL, (func), NULL, NULL, NULL, napi_default, NULL }

#define DECLARE_NODE_API_GETTER(name, func)                              \
  { (name), NULL, NULL, (func), NULL, NULL, napi_default, NULL }

void add_returned_status(napi_env env,
                         const char* key,
                         napi_value object,
                         char* expected_message,
                         napi_status expected_status,
                         napi_status actual_status);

void add_last_status(napi_env env, const char* key, napi_value return_value);

#if defined(HOP_NODE_API_H_)
void add_returned_status(napi_env env,
                         const char* key,
                         napi_value object,
                         char* expected_message,
                         napi_status expected_status,
                         napi_status actual_status) {

  char napi_message_string[100] = "";
  napi_value prop_value;

  if (actual_status != expected_status) {
    snprintf(napi_message_string, sizeof(napi_message_string),
        "Invalid status [%d]", actual_status);
  }

  NODE_API_CALL_RETURN_VOID(env,
      napi_create_string_utf8(
                              env,
                              (actual_status == expected_status ?
                                  expected_message :
                                  napi_message_string),
                              NAPI_AUTO_LENGTH,
                              &prop_value));
  NODE_API_CALL_RETURN_VOID(env,
			    napi_set_named_property(env, object, (char *)key, prop_value));
}

void add_last_status(napi_env env, const char* key, napi_value return_value) {
    napi_value prop_value;
    const napi_extended_error_info* p_last_error;
    NODE_API_CALL_RETURN_VOID(env,
        napi_get_last_error_info(env, &p_last_error));

    NODE_API_CALL_RETURN_VOID(env,
        napi_create_string_utf8(env,
                                (p_last_error->error_message == NULL ?
                                    "napi_ok" :
                                    p_last_error->error_message),
                                NAPI_AUTO_LENGTH,
                                &prop_value));
    NODE_API_CALL_RETURN_VOID(env,
			      napi_set_named_property(env, return_value, (char *)key, prop_value));
}
#endif
#endif
